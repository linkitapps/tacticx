import { supabase } from "@/lib/supabase"
import { ArrowType, PlayerType, TextAnnotationType } from "@/lib/types/editor"
import { nanoid } from "nanoid"

export interface SaveTacticParams {
  tacticId: string | null
  title: string
  description: string
  isPublic: boolean
  players: PlayerType[]
  arrows: ArrowType[]
  textAnnotations: TextAnnotationType[]
}

export interface Tactic {
  id: string
  title: string
  description: string
  isPublic: boolean
  players: PlayerType[]
  arrows: ArrowType[]
  textAnnotations: TextAnnotationType[]
  created_at: string
  updated_at: string
  user_id: string
}

// Check if we're using a mock environment
const isMockEnvironment = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock tactics storage for development
const mockTactics: Record<string, Tactic> = {}

/**
 * Save a tactic to the database
 */
export async function saveTactic({
  tacticId,
  title,
  description,
  isPublic,
  players,
  arrows,
  textAnnotations,
}: SaveTacticParams): Promise<string> {
  if (isMockEnvironment) {
    const now = new Date().toISOString()
    const id = tacticId || nanoid()
    
    mockTactics[id] = {
      id,
      title,
      description,
      isPublic,
      players,
      arrows,
      textAnnotations,
      created_at: mockTactics[id]?.created_at || now,
      updated_at: now,
      user_id: "mock-user-id"
    }
    
    console.log("Mock save tactic:", id)
    return id
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const tacticsData = {
    title,
    description,
    is_public: isPublic,
    players,
    arrows,
    textAnnotations,
    updated_at: new Date().toISOString(),
    user_id: user.id,
  }

  if (tacticId) {
    // Update existing tactic
    const { data, error } = await supabase
      .from("tactics")
      .update(tacticsData)
      .eq("id", tacticId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data.id
  } else {
    // Create new tactic
    const { data, error } = await supabase
      .from("tactics")
      .insert({
        ...tacticsData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data.id
  }
}

/**
 * Load a tactic from the database
 */
export async function loadTactic(id: string): Promise<Tactic> {
  if (isMockEnvironment) {
    const tactic = mockTactics[id]
    if (!tactic) {
      console.log("Mock tactic not found:", id)
      throw new Error("Tactic not found")
    }
    
    console.log("Mock load tactic:", id)
    return tactic
  }
  
  const { data, error } = await supabase
    .from("tactics")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data as Tactic
}

/**
 * Get tactics for the current user
 */
export async function getUserTactics(): Promise<Tactic[]> {
  if (isMockEnvironment) {
    console.log("Mock get user tactics")
    return Object.values(mockTactics).filter(t => t.user_id === "mock-user-id")
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("tactics")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data as Tactic[]
}

/**
 * Get public tactics
 */
export async function getPublicTactics(): Promise<Tactic[]> {
  if (isMockEnvironment) {
    console.log("Mock get public tactics")
    return Object.values(mockTactics).filter(t => t.isPublic)
  }
  
  const { data, error } = await supabase
    .from("tactics")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data as Tactic[]
} 