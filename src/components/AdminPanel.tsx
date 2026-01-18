import { useState, useEffect } from 'react';
import {
  useCharacters,
  useCharacterActions,
  useCharacterResult,
  useAPIConfigs,
  useAPIConfigActions,
  useAPIConfigResult,
  useRooms,
  useRoomCharacterActions
} from '../hooks/useChat';
import type { CharacterCard, APIConfig, APIProvider, RoomCharacter } from '../types/chat';

interface AdminPanelProps {
  onClose: () => void;
}

type TabType = 'characters' | 'apiConfigs' | 'roomCharacters';

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('characters');

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>Admin Panel</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveTab('characters')}
          >
            Characters
          </button>
          <button
            className={`tab-btn ${activeTab === 'apiConfigs' ? 'active' : ''}`}
            onClick={() => setActiveTab('apiConfigs')}
          >
            API Configs
          </button>
          <button
            className={`tab-btn ${activeTab === 'roomCharacters' ? 'active' : ''}`}
            onClick={() => setActiveTab('roomCharacters')}
          >
            Room Characters
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'characters' && <CharacterManager />}
          {activeTab === 'apiConfigs' && <APIConfigManager />}
          {activeTab === 'roomCharacters' && <RoomCharacterManager />}
        </div>
      </div>
    </div>
  );
}

function CharacterManager() {
  const characters = useCharacters();
  const { getCharacters, createCharacter, updateCharacter, deleteCharacter } = useCharacterActions();
  const result = useCharacterResult();
  const [editingChar, setEditingChar] = useState<CharacterCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCharacters();
  }, [getCharacters]);

  useEffect(() => {
    if (result && !result.success && result.error) {
      setError(result.error);
    } else if (result?.success) {
      setError('');
      setIsCreating(false);
      setEditingChar(null);
    }
  }, [result]);

  const handleCreate = (data: Omit<CharacterCard, 'id' | 'createdAt' | 'createdBy'>) => {
    createCharacter(data);
  };

  const handleUpdate = (char: CharacterCard) => {
    updateCharacter(char);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(id);
    }
  };

  if (isCreating || editingChar) {
    return (
      <CharacterForm
        character={editingChar}
        onSave={(data) => {
          if (editingChar) {
            handleUpdate({ ...editingChar, ...data });
          } else {
            handleCreate(data);
          }
        }}
        onCancel={() => {
          setIsCreating(false);
          setEditingChar(null);
        }}
        error={error}
      />
    );
  }

  return (
    <div className="manager-list">
      <div className="manager-header">
        <h3>Characters ({characters.length})</h3>
        <button className="create-btn" onClick={() => setIsCreating(true)}>
          + Create Character
        </button>
      </div>

      {characters.length === 0 ? (
        <p className="empty-message">No characters created yet.</p>
      ) : (
        <div className="item-list">
          {characters.map(char => (
            <div key={char.id} className="item-card">
              <div className="item-info">
                <h4>{char.name}</h4>
                <p>{char.description?.substring(0, 100) || 'No description'}...</p>
                <span className="item-meta">Tags: {char.tags?.join(', ') || 'None'}</span>
              </div>
              <div className="item-actions">
                <button onClick={() => setEditingChar(char)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(char.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CharacterFormProps {
  character: CharacterCard | null;
  onSave: (data: Omit<CharacterCard, 'id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
  error: string;
}

function CharacterForm({ character, onSave, onCancel, error }: CharacterFormProps) {
  const [name, setName] = useState(character?.name || '');
  const [description, setDescription] = useState(character?.description || '');
  const [personality, setPersonality] = useState(character?.personality || '');
  const [scenario, setScenario] = useState(character?.scenario || '');
  const [firstMes, setFirstMes] = useState(character?.first_mes || '');
  const [mesExample, setMesExample] = useState(character?.mes_example || '');
  const [systemPrompt, setSystemPrompt] = useState(character?.system_prompt || '');
  const [creatorNotes, setCreatorNotes] = useState(character?.creator_notes || '');
  const [tags, setTags] = useState(character?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      personality,
      scenario,
      first_mes: firstMes,
      mes_example: mesExample,
      system_prompt: systemPrompt,
      creator_notes: creatorNotes,
      tags: tags.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <h3>{character ? 'Edit Character' : 'Create Character'}</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Character name"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Character description..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Personality</label>
        <textarea
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="Personality traits..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Scenario</label>
        <textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="The scenario or context..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Custom system prompt (optional)..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>First Message</label>
        <textarea
          value={firstMes}
          onChange={(e) => setFirstMes(e.target.value)}
          placeholder="Character's greeting message..."
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>Example Messages</label>
        <textarea
          value={mesExample}
          onChange={(e) => setMesExample(e.target.value)}
          placeholder="Example dialogue to help the AI..."
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>Creator Notes</label>
        <textarea
          value={creatorNotes}
          onChange={(e) => setCreatorNotes(e.target.value)}
          placeholder="Notes for other users..."
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">{character ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}

function APIConfigManager() {
  const configs = useAPIConfigs();
  const { getAPIConfigs, createAPIConfig, updateAPIConfig, deleteAPIConfig } = useAPIConfigActions();
  const result = useAPIConfigResult();
  const [editingConfig, setEditingConfig] = useState<APIConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAPIConfigs();
  }, [getAPIConfigs]);

  useEffect(() => {
    if (result && !result.success && result.error) {
      setError(result.error);
    } else if (result?.success) {
      setError('');
      setIsCreating(false);
      setEditingConfig(null);
    }
  }, [result]);

  const handleCreate = (data: Omit<APIConfig, 'id' | 'createdAt'>) => {
    createAPIConfig(data);
  };

  const handleUpdate = (config: APIConfig) => {
    updateAPIConfig(config);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this API config?')) {
      deleteAPIConfig(id);
    }
  };

  if (isCreating || editingConfig) {
    return (
      <APIConfigForm
        config={editingConfig}
        onSave={(data) => {
          if (editingConfig) {
            handleUpdate({ ...editingConfig, ...data });
          } else {
            handleCreate(data);
          }
        }}
        onCancel={() => {
          setIsCreating(false);
          setEditingConfig(null);
        }}
        error={error}
      />
    );
  }

  return (
    <div className="manager-list">
      <div className="manager-header">
        <h3>API Configurations ({configs.length})</h3>
        <button className="create-btn" onClick={() => setIsCreating(true)}>
          + Add API Config
        </button>
      </div>

      {configs.length === 0 ? (
        <p className="empty-message">No API configurations yet.</p>
      ) : (
        <div className="item-list">
          {configs.map(config => (
            <div key={config.id} className={`item-card ${config.isActive ? 'active' : 'inactive'}`}>
              <div className="item-info">
                <h4>{config.name} <span className={`status-badge ${config.isActive ? 'active' : ''}`}>
                  {config.isActive ? 'Active' : 'Inactive'}
                </span></h4>
                <p>Provider: {config.provider} | Model: {config.model}</p>
                <span className="item-meta">
                  API Key: {config.apiKey || 'None'}
                  {config.apiUrl && ` | URL: ${config.apiUrl}`}
                </span>
              </div>
              <div className="item-actions">
                <button onClick={() => setEditingConfig(config)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(config.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface APIConfigFormProps {
  config: APIConfig | null;
  onSave: (data: Omit<APIConfig, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  error: string;
}

function APIConfigForm({ config, onSave, onCancel, error }: APIConfigFormProps) {
  const [name, setName] = useState(config?.name || '');
  const [provider, setProvider] = useState<APIProvider>(config?.provider || 'openai');
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [apiUrl, setApiUrl] = useState(config?.apiUrl || '');
  const [model, setModel] = useState(config?.model || '');
  const [maxTokens, setMaxTokens] = useState(config?.maxTokens || 500);
  const [temperature, setTemperature] = useState(config?.temperature || 0.7);
  const [isActive, setIsActive] = useState(config?.isActive ?? true);

  const providers: { value: APIProvider; label: string; needsKey: boolean; needsUrl: boolean; defaultModel: string }[] = [
    { value: 'openai', label: 'OpenAI', needsKey: true, needsUrl: false, defaultModel: 'gpt-4o-mini' },
    { value: 'anthropic', label: 'Anthropic', needsKey: true, needsUrl: false, defaultModel: 'claude-3-haiku-20240307' },
    { value: 'openrouter', label: 'OpenRouter', needsKey: true, needsUrl: false, defaultModel: 'openai/gpt-3.5-turbo' },
    { value: 'ollama', label: 'Ollama (Local)', needsKey: false, needsUrl: true, defaultModel: 'llama2' },
    { value: 'kobold', label: 'KoboldAI', needsKey: false, needsUrl: true, defaultModel: '' },
    { value: 'custom', label: 'Custom API', needsKey: true, needsUrl: true, defaultModel: '' }
  ];

  const selectedProvider = providers.find(p => p.value === provider);

  const handleProviderChange = (newProvider: APIProvider) => {
    setProvider(newProvider);
    const prov = providers.find(p => p.value === newProvider);
    if (prov?.defaultModel && !model) {
      setModel(prov.defaultModel);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      provider,
      apiKey: apiKey || undefined,
      apiUrl: apiUrl || undefined,
      model,
      maxTokens,
      temperature,
      isActive
    });
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <h3>{config ? 'Edit API Config' : 'Add API Config'}</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Config name (e.g., 'My OpenAI')"
        />
      </div>

      <div className="form-group">
        <label>Provider *</label>
        <select value={provider} onChange={(e) => handleProviderChange(e.target.value as APIProvider)}>
          {providers.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {selectedProvider?.needsKey && (
        <div className="form-group">
          <label>API Key {provider !== 'custom' && '*'}</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={config ? 'Enter new key or leave blank to keep current' : 'Your API key'}
          />
        </div>
      )}

      {selectedProvider?.needsUrl && (
        <div className="form-group">
          <label>API URL *</label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={provider === 'ollama' ? 'http://localhost:11434' : provider === 'kobold' ? 'http://localhost:5001' : 'https://api.example.com/v1/chat'}
          />
        </div>
      )}

      <div className="form-group">
        <label>Model</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={selectedProvider?.defaultModel || 'Model name'}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Max Tokens</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            min={1}
            max={4096}
          />
        </div>

        <div className="form-group">
          <label>Temperature</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            min={0}
            max={2}
            step={0.1}
          />
        </div>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active (can be used for AI characters)
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">{config ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}

function RoomCharacterManager() {
  const rooms = useRooms();
  const characters = useCharacters();
  const configs = useAPIConfigs();
  const { getCharacters } = useCharacterActions();
  const { getAPIConfigs } = useAPIConfigActions();
  const { addCharacterToRoom, removeCharacterFromRoom } = useRoomCharacterActions();
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    getCharacters();
    getAPIConfigs();
  }, [getCharacters, getAPIConfigs]);

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const roomCharacters = selectedRoomData?.characters || [];

  const handleAddCharacter = (roomChar: RoomCharacter) => {
    if (selectedRoom) {
      addCharacterToRoom(selectedRoom, roomChar);
      setShowAddForm(false);
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    if (selectedRoom && confirm('Remove this character from the room?')) {
      removeCharacterFromRoom(selectedRoom, characterId);
    }
  };

  return (
    <div className="manager-list">
      <div className="manager-header">
        <h3>Room Characters</h3>
      </div>

      <div className="form-group">
        <label>Select Room</label>
        <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
          <option value="">-- Select a room --</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
      </div>

      {selectedRoom && (
        <>
          <div className="room-characters-header">
            <h4>Characters in {selectedRoomData?.name}</h4>
            <button className="create-btn" onClick={() => setShowAddForm(true)}>
              + Add Character
            </button>
          </div>

          {showAddForm && (
            <AddRoomCharacterForm
              characters={characters}
              configs={configs}
              existingCharIds={roomCharacters.map(rc => rc.characterId)}
              onAdd={handleAddCharacter}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {roomCharacters.length === 0 ? (
            <p className="empty-message">No characters in this room yet.</p>
          ) : (
            <div className="item-list">
              {roomCharacters.map(rc => {
                const char = characters.find(c => c.id === rc.characterId);
                const config = configs.find(c => c.id === rc.apiConfigId);
                return (
                  <div key={rc.characterId} className="item-card">
                    <div className="item-info">
                      <h4>{char?.name || 'Unknown Character'}</h4>
                      <p>API: {config?.name || 'Unknown Config'}</p>
                      <span className="item-meta">
                        Triggers: {rc.triggerOnMention ? 'Mention' : ''}
                        {rc.triggerOnMessage ? ` Random (${rc.triggerProbability}%)` : ''}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button className="delete-btn" onClick={() => handleRemoveCharacter(rc.characterId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface AddRoomCharacterFormProps {
  characters: CharacterCard[];
  configs: APIConfig[];
  existingCharIds: string[];
  onAdd: (roomChar: RoomCharacter) => void;
  onCancel: () => void;
}

function AddRoomCharacterForm({ characters, configs, existingCharIds, onAdd, onCancel }: AddRoomCharacterFormProps) {
  const [characterId, setCharacterId] = useState('');
  const [apiConfigId, setApiConfigId] = useState('');
  const [triggerOnMention, setTriggerOnMention] = useState(true);
  const [triggerOnMessage, setTriggerOnMessage] = useState(false);
  const [triggerProbability, setTriggerProbability] = useState(10);

  const availableCharacters = characters.filter(c => !existingCharIds.includes(c.id));
  const activeConfigs = configs.filter(c => c.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterId || !apiConfigId) return;
    onAdd({
      characterId,
      apiConfigId,
      triggerOnMention,
      triggerOnMessage,
      triggerProbability
    });
  };

  return (
    <form className="add-room-char-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Character *</label>
        <select value={characterId} onChange={(e) => setCharacterId(e.target.value)} required>
          <option value="">-- Select character --</option>
          {availableCharacters.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>API Config *</label>
        <select value={apiConfigId} onChange={(e) => setApiConfigId(e.target.value)} required>
          <option value="">-- Select API --</option>
          {activeConfigs.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.provider})</option>
          ))}
        </select>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={triggerOnMention}
            onChange={(e) => setTriggerOnMention(e.target.checked)}
          />
          Respond when mentioned (@name or name)
        </label>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={triggerOnMessage}
            onChange={(e) => setTriggerOnMessage(e.target.checked)}
          />
          Random responses to messages
        </label>
      </div>

      {triggerOnMessage && (
        <div className="form-group">
          <label>Response probability (%)</label>
          <input
            type="number"
            value={triggerProbability}
            onChange={(e) => setTriggerProbability(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Add to Room</button>
      </div>
    </form>
  );
}
