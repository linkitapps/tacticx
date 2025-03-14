"use client"

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStoreImpl';
import { 
  Player, 
  Arrow, 
  TextAnnotation, 
  ArrowStyle
} from '@/store/editorStoreImpl';
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Type, Hash, Trash2, Save, Users, CircleDot, ArrowRight, Text } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

/**
 * A unified properties panel that handles properties for all element types
 */
export default function PropertiesPanel() {
  const { 
    selectedElementId, 
    players, 
    arrows, 
    textAnnotations
  } = useEditorStore();

  // Find the selected element
  const selectedPlayer = players.find((p: Player) => p.id === selectedElementId);
  const selectedArrow = arrows.find((a: Arrow) => a.id === selectedElementId);
  const selectedText = textAnnotations.find((t: TextAnnotation) => t.id === selectedElementId);

  if (!selectedElementId) {
    return null;
  }

  if (selectedPlayer) {
    return <PlayerPropertiesPanel player={selectedPlayer} />;
  }

  if (selectedArrow) {
    return <ArrowPropertiesPanel arrow={selectedArrow} />;
  }

  if (selectedText) {
    return <TextPropertiesPanel text={selectedText} />;
  }

  return null;
}

/**
 * Properties panel specifically for Player elements
 */
function PlayerPropertiesPanel({ player }: { player: Player }) {
  // Create local state to track changes
  const [number, setNumber] = useState(player.number);
  const [label, setLabel] = useState(player.label || '');
  const [color, setColor] = useState(player.color);
  const [isDirty, setIsDirty] = useState(false);

  // Get the store methods
  const { 
    updatePlayer, 
    deletePlayer 
  } = useEditorStore();

  // Sync local state when player changes
  useEffect(() => {
    console.log(`Properties panel received player update:`, player);
    setNumber(player.number);
    setLabel(player.label || '');
    setColor(player.color);
    setIsDirty(false);
  }, [player]);

  // Track changes
  useEffect(() => {
    const hasChanged = 
      number !== player.number ||
      label !== (player.label || '') ||
      color !== player.color;
      
    console.log(`isDirty check - hasChanged: ${hasChanged}`, {
      number, playerNumber: player.number,
      label, playerLabel: player.label || '',
      color, playerColor: player.color
    });
    
    setIsDirty(hasChanged);
  }, [number, label, color, player]);

  // Handle number input change - make sure it REPLACES the value, not appends
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log(`Setting number from ${number} to ${newValue}`);
    
    // Mark as dirty if the value actually changed
    if (newValue !== player.number) {
      console.log(`Number changed from ${player.number} to ${newValue} - should be dirty`);
    }
    
    // Directly replace the value, not append
    setNumber(newValue);
  };

  // Alternative number handling with +/- buttons to ensure updates work
  const incrementNumber = () => {
    const current = parseInt(number) || 0;
    const newNumber = String(current + 1);
    console.log(`Incrementing number from ${number} to ${newNumber}`);
    setNumber(newNumber);
  };
  
  const decrementNumber = () => {
    const current = parseInt(number) || 0;
    if (current > 1) {
      const newNumber = String(current - 1);
      console.log(`Decrementing number from ${number} to ${newNumber}`);
      setNumber(newNumber);
    }
  };

  // Handle color change with direct update to store
  const handleColorChange = (newColor: string) => {
    console.log(`Setting color from ${color} to ${newColor}`);
    
    // Set local state
    setColor(newColor);
    
    // We no longer update the store immediately
    // Just mark as dirty if the color differs from original player color
    if (newColor !== player.color) {
      setIsDirty(true);
    }
  };

  // Handle applying changes for all properties
  const handleApply = () => {
    if (!isDirty) return;

    console.log(`---- APPLYING UPDATES TO PLAYER ${player.id} ----`);
    
    // Direct explicit updates with all properties
    const updates = {
      number, 
      label,
      color
    };
    
    console.log(`Updates to apply:`, updates);
    
    // Apply updates to the store
    updatePlayer(player.id, updates);
    
    // Reset dirty state
    setIsDirty(false);
  };

  const handleDelete = () => {
    deletePlayer(player.id);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md">
      <h3 className="text-white font-semibold mb-4">Player Properties</h3>
      
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <Label htmlFor="player-number" className="text-sm font-medium text-gray-300">
            Preview
          </Label>
          <div className="mt-1 flex justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 0 2px #30363D, 0 0 10px 2px ${color}40`,
              }}
            >
              {number}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="space-y-3">
            <div>
              <Label htmlFor="player-number" className="text-sm font-medium text-gray-300">
                Number
              </Label>
              <div className="flex items-center">
                <Input
                  id="player-number"
                  type="text"
                  value={number}
                  onChange={handleNumberChange}
                  className="h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
                />
                <div className="flex flex-col ml-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    className="h-4 mb-1 px-2 py-0 text-xs"
                    onClick={incrementNumber}
                  >+</Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    className="h-4 px-2 py-0 text-xs"
                    onClick={decrementNumber}
                  >-</Button>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="player-name" className="text-sm font-medium text-gray-300">
                Label
              </Label>
              <Input
                id="player-name"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter player name or position"
                className="h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Color
        </Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-9 p-1 bg-[#21262D] border-[#30363D] focus:border-primary"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Predefined color options */}
          {['#2563EB', '#E11D48', '#16A34A', '#FB923C', '#FACC15', '#8B5CF6', '#EC4899', '#0EA5E9'].map(colorOption => (
            <button
              key={colorOption}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${color === colorOption ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: colorOption }}
              onClick={() => handleColorChange(colorOption)}
            />
          ))}
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        <Button
          onClick={handleApply}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 transition-all",
            isDirty
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-[#21262D] hover:bg-[#30363D] text-gray-400 border border-[#30363D]",
          )}
          disabled={!isDirty}
        >
          <Save className="h-4 w-4" />
          Apply Changes
        </Button>
        
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="px-3"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Properties panel specifically for Arrow elements
 */
function ArrowPropertiesPanel({ arrow }: { arrow: Arrow }) {
  // Create local state to track changes
  const [color, setColor] = useState(arrow.color);
  const [width, setWidth] = useState(arrow.width);
  const [style, setStyle] = useState<ArrowStyle>(arrow.style || 'solid');
  const [isDirty, setIsDirty] = useState(false);

  // Get the store methods
  const { updateArrow, deleteArrow } = useEditorStore();

  // Sync local state when arrow changes
  useEffect(() => {
    setColor(arrow.color);
    setWidth(arrow.width);
    setStyle(arrow.style || 'solid');
    setIsDirty(false);
  }, [arrow]);

  // Track changes
  useEffect(() => {
    const hasChanged = 
      color !== arrow.color ||
      width !== arrow.width ||
      style !== (arrow.style || 'solid');
      
    setIsDirty(hasChanged);
  }, [color, width, style, arrow]);

  // Handle applying changes
  const handleApply = () => {
    if (!isDirty) return;

    console.log(`Applying updates to arrow ${arrow.id}`);
    
    // Apply updates to the store
    updateArrow(arrow.id, {
      color,
      width,
      style
    });
    
    setIsDirty(false);
  };

  const handleDelete = () => {
    deleteArrow(arrow.id);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md">
      <h3 className="text-white font-semibold mb-4">Arrow Properties</h3>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Color
        </Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-9 p-1 bg-[#21262D] border-[#30363D] focus:border-primary"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Width ({width}px)
        </Label>
        <Slider
          value={[width]}
          min={1}
          max={10}
          step={1}
          onValueChange={([value]) => setWidth(value)}
          className="mt-2"
        />
      </div>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Style
        </Label>
        <RadioGroup 
          value={style} 
          onValueChange={(value) => setStyle(value as ArrowStyle)} 
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="solid" id="style-solid" className="border-[#30363D]" />
            <Label htmlFor="style-solid" className="text-gray-300">Solid</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dashed" id="style-dashed" className="border-[#30363D]" />
            <Label htmlFor="style-dashed" className="text-gray-300">Dashed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dotted" id="style-dotted" className="border-[#30363D]" />
            <Label htmlFor="style-dotted" className="text-gray-300">Dotted</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex gap-2 mt-6">
        <Button
          onClick={handleApply}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 transition-all",
            isDirty
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-[#21262D] hover:bg-[#30363D] text-gray-400 border border-[#30363D]",
          )}
          disabled={!isDirty}
        >
          <Save className="h-4 w-4" />
          Apply Changes
        </Button>
        
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="px-3"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Properties panel specifically for Text elements
 */
function TextPropertiesPanel({ text }: { text: TextAnnotation }) {
  // Create local state to track changes
  const [content, setContent] = useState(text.text);
  const [fontSize, setFontSize] = useState(text.fontSize || 16);
  const [color, setColor] = useState(text.color || '#ffffff');
  const [isDirty, setIsDirty] = useState(false);

  // Get the store methods
  const { 
    updateTextAnnotation, 
    deleteText 
  } = useEditorStore();

  // Sync local state when text changes
  useEffect(() => {
    setContent(text.text);
    setFontSize(text.fontSize || 16);
    setColor(text.color || '#ffffff');
    setIsDirty(false);
  }, [text]);

  // Track changes
  useEffect(() => {
    const hasChanged = 
      content !== text.text ||
      fontSize !== (text.fontSize || 16) ||
      color !== (text.color || '#ffffff');
      
    setIsDirty(hasChanged);
  }, [content, fontSize, color, text]);

  // Handle applying changes
  const handleApply = () => {
    if (!isDirty) return;

    console.log(`Applying updates to text ${text.id}`);
    
    // Apply updates to the store
    updateTextAnnotation(text.id, {
      text: content,
      fontSize,
      color
    });
    
    setIsDirty(false);
  };

  const handleDelete = () => {
    deleteText(text.id);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md">
      <h3 className="text-white font-semibold mb-4">Text Properties</h3>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Text Content
        </Label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-24 bg-[#21262D] border-[#30363D] focus:border-primary rounded-md p-2 mt-1 text-white"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Color
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-9 p-1 bg-[#21262D] border-[#30363D] focus:border-primary"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-300">
          Font Size ({fontSize}px)
        </Label>
        <Slider
          value={[fontSize]}
          min={8}
          max={48}
          step={1}
          onValueChange={([value]) => setFontSize(value)}
          className="mt-2"
        />
      </div>
      
      <div className="flex gap-2 mt-6">
        <Button
          onClick={handleApply}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 transition-all",
            isDirty
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-[#21262D] hover:bg-[#30363D] text-gray-400 border border-[#30363D]",
          )}
          disabled={!isDirty}
        >
          <Save className="h-4 w-4" />
          Apply Changes
        </Button>
        
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="px-3"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 