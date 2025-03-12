import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // This would normally fetch from your database
  const tactics = [
    { id: "1", title: "Counter Attack 4-3-3", updatedAt: "2023-12-01" },
    { id: "2", title: "Defensive 5-4-1", updatedAt: "2023-11-28" },
    { id: "3", title: "Possession 4-2-3-1", updatedAt: "2023-11-25" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/editor">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Tactic
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tactics.map((tactic) => (
          <Card key={tactic.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{tactic.title}</CardTitle>
              <CardDescription>Last updated: {tactic.updatedAt}</CardDescription>
            </CardHeader>
            <CardContent className="aspect-video bg-muted/30 flex items-center justify-center">
              <span className="text-muted-foreground">Tactic Preview</span>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tactics/${tactic.id}`}>View</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/editor?id=${tactic.id}`}>Edit</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

