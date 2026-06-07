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

  const [fields, setFields] = React.useState<ConfigField[]>(() => transformFromJSON(data));
  const lastEmittedData = React.useRef<any>(data);

  React.useEffect(() => {
    if (data !== lastEmittedData.current) {
      setFields(transformFromJSON(data));
      lastEmittedData.current = data;
    }
  }, [data]);

  const updateFields = (newFields: ConfigField[]) => {
    setFields(newFields);
    const newJson = transformToJSON(newFields);
    lastEmittedData.current = newJson;
    onChange(newJson);
  };

  return (
    <div className="space-y-6 pb-24">
      <FieldList 
        fields={fields} 
        onUpdate={updateFields} 
        level={0} 
      />
      
      <button 
        className="w-full border-2 border-dashed border-[#e5e5e5] hover:border-black hover:bg-[#f5f5f5] text-[#737373] hover:text-black py-8 rounded-2xl transition-all group flex flex-col gap-3 h-auto shadow-none items-center justify-center"
        onClick={() => updateFields([...fields, {
          id: Math.random().toString(36).substr(2, 9),
          key: '',
          type: 'string',
          value: '',
          isOpen: true
        }])}
      >
        <div className="w-10 h-10 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all text-black shadow-sm">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest">Add Root Field</span>
      </button>
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
    <div className={`space-y-3 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-[#e5e5e5] relative' : ''}`}>
      {fields.map((field, index) => (
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
      className="group/item relative"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-[#e5e5e5] rounded-2xl p-2 pr-3 hover:border-black/20 hover:shadow-md transition-all shadow-sm">
        
        <div className="cursor-grab p-2 rounded-lg text-[#b0b0b0] hover:text-black hover:bg-[#f5f5f5] transition-all shrink-0 self-center opacity-0 group-hover/item:opacity-100" title="Drag to reorder">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center min-w-0 w-full sm:w-auto">
          <div className="w-full sm:w-[200px] shrink-0">
            <Input 
              value={field.key}
              onChange={(e) => onChange({ key: e.target.value })}
              placeholder="property_name"
              className="h-10 w-full bg-transparent border-transparent hover:border-[#e5e5e5] focus-visible:bg-[#f5f5f5] focus-visible:border-black font-mono text-sm shadow-none rounded-xl text-black font-bold px-3"
            />
          </div>

          <div className="w-full sm:w-[140px] shrink-0">
            <Select value={field.type} onValueChange={(v) => handleTypeChange(v as ConfigValueType)}>
              <SelectTrigger className="h-10 w-full bg-transparent border-transparent hover:border-[#e5e5e5] focus-visible:ring-0 text-[11px] font-bold uppercase tracking-widest px-3 shadow-none rounded-xl">
                <div className="flex items-center gap-2 text-[#737373]">
                  <Icon className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e5e5e5] rounded-xl shadow-lg">
                {['string', 'number', 'boolean', 'object', 'array'].map((t) => (
                  <SelectItem key={t} value={t} className="text-[11px] uppercase font-bold tracking-widest text-[#737373] focus:text-black focus:bg-[#f5f5f5] cursor-pointer">
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0 w-full">
            {field.type === 'string' && (
              <Input 
                value={field.value}
                onChange={(e) => onChange({ value: e.target.value })}
                placeholder="value"
                className="h-10 w-full bg-[#f5f5f5]/50 border-transparent hover:border-[#e5e5e5] focus-visible:border-black focus-visible:bg-white text-sm text-black rounded-xl shadow-none placeholder:text-[#b0b0b0] transition-colors font-medium px-3"
              />
            )}
            {field.type === 'number' && (
              <Input 
                type="number"
                value={field.value}
                onChange={(e) => onChange({ value: Number(e.target.value) })}
                className="h-10 w-full bg-[#f5f5f5]/50 border-transparent hover:border-[#e5e5e5] focus-visible:border-black focus-visible:bg-white text-sm text-black rounded-xl shadow-none transition-colors font-medium px-3"
              />
            )}
            {field.type === 'boolean' && (
              <div className="flex items-center gap-3 px-4 h-10 bg-[#f5f5f5]/60 rounded-xl w-fit border border-transparent">
                <Switch 
                  checked={field.value}
                  onCheckedChange={(v) => onChange({ value: v })}
                />
                <span className={`text-[11px] uppercase font-bold tracking-widest ${field.value ? 'text-black' : 'text-[#737373]'}`}>
                  {field.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            )}
            {(field.type === 'object' || field.type === 'array') && (
              <button 
                onClick={() => onChange({ isOpen: !field.isOpen })}
                className="h-10 hover:bg-[#f5f5f5] flex items-center gap-2 px-4 rounded-xl transition-colors text-[#737373] hover:text-black w-full sm:w-auto"
              >
                {field.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {Array.isArray(field.value) ? field.value.length : 0} {field.type === 'array' ? 'Elements' : 'Keys'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity">
          <button 
            onClick={onDelete}
            className="h-8 w-8 sm:h-9 sm:w-9 text-[#b0b0b0] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 flex items-center justify-center"
            title="Delete Field"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(field.type === 'object' || field.type === 'array') && field.isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden relative"
          >
            <div className="absolute left-[18px] top-0 bottom-6 w-px bg-border/40 z-0" />
            <div className="py-3 pl-8 relative z-10">
              <FieldList 
                fields={Array.isArray(field.value) ? field.value : []}
                onUpdate={(newSubFields) => onChange({ value: newSubFields })}
                level={level + 1}
              />
              <div className="mt-4">
                <button 
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-[#e5e5e5] text-[11px] font-bold uppercase tracking-widest text-[#737373] hover:border-black hover:text-black hover:bg-[#f5f5f5] h-10 rounded-xl transition-all"
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
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

