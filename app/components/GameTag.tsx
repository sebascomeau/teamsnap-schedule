import { Swords } from "lucide-react";
import { Badge } from "./ui/badge";
export const GameTag = () => (
  <Badge variant="secondary" className="flex items-center gap-1">
    <Swords size={12} />
    <span>Game</span>
  </Badge>
);
