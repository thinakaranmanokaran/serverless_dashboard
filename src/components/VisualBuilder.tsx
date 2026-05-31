import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Type, 
  Hash, 
  ToggleLeft, 
  Layers, 
  ListOrdered, 
  MoreVertical,
  GripVertical,
  Braces,
  Settings2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export type ConfigValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface ConfigField {
  id: string;
  key: string;
  type: ConfigValueType;
  value: any;
  isOpen?: boolean;
}

interface VisualBuilderProps {
  data: any;
  onChange: (newData: any) => void;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({ data, onChange }) => {
  
  // Helper to convert internal state back to JSON
  const transformToJSON = (fields: ConfigField[]): any => {
    const result: any = {};
    fields.forEach(field => {
      if (!field.key) return; // Skip empty keys
      if (field.type === 'object') {
        result[field.key] = transformToJSON(field.value);
      } else if (field.type === 'array') {
        result[field.key] = field.value.map((item: any) => {
           if (typeof item === 'object' && item !== null && 'id' in item) {
             // If it's a field list
             return transformToJSON([item])[item.key];
           }
           return item;
        });
      } else {
        result[field.key] = field.value;
      }
    });
    return result;
  };

  // Helper to convert JSON to internal state
  const transformFromJSON = (json: any): ConfigField[] => {
    if (typeof json !== 'object' || json === null || Array.isArray(json)) return [];
    return Object.entries(json).map(([key, value]) => {
      let type: ConfigValueType = 'string';
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) type = 'array';
      else if (typeof value === 'object' && value !== null) type = 'object';

      return {
        id: Math.random().toString(36).substr(2, 9),
        key,
        type,
        value: type === 'object' ? transformFromJSON(value) : value,
        isOpen: true,
      };
    });
  };

  const fields = React.useMemo(() => transformFromJSON(data), [data]);

  const updateFields = (newFields: ConfigField[]) => {
    onChange(transformToJSON(newFields));
  };

  return (
    <div className="space-y-6">
      <FieldList 
        fields={fields} 
        onUpdate={updateFields} 
        level={0} 
      />
      
      <Button 
        variant="ghost" 
        className="w-full border-2 border-dashed border-border hover:border-link hover:bg-link/5 text-muted-foreground hover:text-link py-8 rounded-xl transition-all group flex flex-col gap-2 h-auto"
        onClick={() => updateFields([...fields, {
          id: Math.random().toString(36).substr(2, 9),
          key: '',
          type: 'string',
          value: '',
          isOpen: true
        }])}
      >
        <div className="w-8 h-8 rounded bg-secondary hairline flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em]">Add New Field</span>
      </Button>
    </div>
  );
};

interface FieldListProps {
  fields: ConfigField[];
  onUpdate: (fields: ConfigField[]) => void;
  level: number;
}

const FieldList: React.FC<FieldListProps> = ({ fields, onUpdate, level }) => {
  const handleFieldChange = (id: string, updates: Partial<ConfigField>) => {
    onUpdate(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDelete = (id: string) => {
    onUpdate(fields.filter(f => f.id !== id));
  };

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-6 pl-6 border-l-2 border-border' : ''}`}>
      {fields.map((field) => (
        <FieldItem 
          key={field.id} 
          field={field} 
          onChange={(updates) => handleFieldChange(field.id, updates)}
          onDelete={() => handleDelete(field.id)}
          level={level}
        />
      ))}
    </div>
  );
};

interface FieldItemProps {
  field: ConfigField;
  onChange: (updates: Partial<ConfigField>) => void;
  onDelete: () => void;
  level: number;
}

const FieldItem: React.FC<FieldItemProps> = ({ field, onChange, onDelete, level }) => {
  const typeIcons: Record<ConfigValueType, any> = {
    string: Type,
    number: Hash,
    boolean: ToggleLeft,
    object: Braces,
    array: ListOrdered,
  };

  const Icon = typeIcons[field.type];

  const handleTypeChange = (newType: ConfigValueType) => {
    let defaultValue: any = '';
    if (newType === 'number') defaultValue = 0;
    if (newType === 'boolean') defaultValue = false;
    if (newType === 'object') defaultValue = [];
    if (newType === 'array') defaultValue = [];
    
    onChange({ type: newType, value: defaultValue, isOpen: true });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="flex items-center gap-3 bg-card hairline rounded-xl p-3 hover:bg-secondary/30 transition-all card-shadow">
        <div className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 flex gap-3 items-center min-w-0">
          <div className="w-[180px] shrink-0">
            <Input 
              value={field.key}
              onChange={(e) => onChange({ key: e.target.value })}
              placeholder="property_name"
              className="h-9 bg-background border-border focus-visible:ring-link font-mono text-xs rounded-md"
            />
          </div>

          <div className="w-28 shrink-0">
            <Select value={field.type} onValueChange={(v) => handleTypeChange(v as ConfigValueType)}>
              <SelectTrigger className="h-9 bg-background border-border text-[10px] font-bold uppercase tracking-widest px-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-link" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-lg">
                <SelectItem value="string" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">STRING</SelectItem>
                <SelectItem value="number" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">NUMBER</SelectItem>
                <SelectItem value="boolean" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">BOOLEAN</SelectItem>
                <SelectItem value="object" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">OBJECT</SelectItem>
                <SelectItem value="array" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">ARRAY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0">
            {field.type === 'string' && (
              <Input 
                value={field.value}
                onChange={(e) => onChange({ value: e.target.value })}
                placeholder="value"
                className="h-9 bg-secondary/50 border-transparent focus-visible:border-link text-xs text-foreground rounded-md placeholder:text-muted-foreground/30"
              />
            )}
            {field.type === 'number' && (
              <Input 
                type="number"
                value={field.value}
                onChange={(e) => onChange({ value: Number(e.target.value) })}
                className="h-9 bg-secondary/50 border-transparent focus-visible:border-link text-xs text-foreground rounded-md"
              />
            )}
            {field.type === 'boolean' && (
              <div className="flex items-center gap-3 px-2">
                <Switch 
                  checked={field.value}
                  onCheckedChange={(v) => onChange({ value: v })}
                />
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {field.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            )}
            {(field.type === 'object' || field.type === 'array') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onChange({ isOpen: !field.isOpen })}
                className="h-9 hover:bg-secondary flex items-center gap-2 px-3 rounded-md transition-colors"
              >
                {field.isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {Array.isArray(field.value) ? field.value.length : 0} {field.type === 'array' ? 'Elements' : 'Keys'}
                </span>
              </Button>
            )}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete}
          className="h-8 w-8 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 rounded-md transition-all opacity-0 group-hover:opacity-100 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence>
        {(field.type === 'object' || field.type === 'array') && field.isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-3">
              <FieldList 
                fields={Array.isArray(field.value) ? field.value : []}
                onUpdate={(newSubFields) => onChange({ value: newSubFields })}
                level={level + 1}
              />
              <div className={`${level === 0 ? 'ml-12 pr-6' : 'ml-6 pl-6 pr-6'}`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mt-2 w-full text-[11px] font-semibold text-link hover:bg-link/5 h-9 rounded-md justify-start px-4 transition-colors"
                  onClick={() => onChange({ 
                    value: [...(Array.isArray(field.value) ? field.value : []), {
                      id: Math.random().toString(36).substr(2, 9),
                      key: field.type === 'array' ? `item_${field.value.length}` : '',
                      type: 'string',
                      value: '',
                      isOpen: true
                    }]
                  })}
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  Add Sub-Item
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

