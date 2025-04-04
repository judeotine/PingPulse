
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export interface ServerOption {
  id: string;
  name: string;
  location: string;
  distance: number;
}

interface ServerSelectorProps {
  servers: ServerOption[];
  selectedServer: string;
  onServerChange: (serverId: string) => void;
  isLoading: boolean;
}

const ServerSelector = ({ 
  servers, 
  selectedServer, 
  onServerChange, 
  isLoading 
}: ServerSelectorProps) => {
  return (
    <Select 
      value={selectedServer} 
      onValueChange={onServerChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a test server" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Test Servers</SelectLabel>
          {servers.map(server => (
            <SelectItem key={server.id} value={server.id}>
              {server.name} ({server.location}) - {server.distance.toFixed(0)} km
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ServerSelector;
