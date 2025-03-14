declare module '@/components/editor/soccer-field' {
  export function SoccerField(): JSX.Element;
}

declare module '@/components/editor/player-marker' {
  export interface PlayerProps {
    player: any;
    onDragStart: () => void;
    onDragEnd: () => void;
  }
  export function PlayerMarker(props: PlayerProps): JSX.Element;
}

declare module '@/components/editor/text-annotation' {
  export interface TextAnnotationProps {
    annotation: any;
    onDragStart: () => void;
    onDragEnd: () => void;
  }
  export function TextAnnotation(props: TextAnnotationProps): JSX.Element;
} 