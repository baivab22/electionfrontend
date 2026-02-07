import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onCreate: (data: { title: string; description?: string; choices: Array<{ label: string }>; startAt?: string; endAt?: string; allowAnonymous?: boolean }) => void;
  onCancel?: () => void;
}

const PollCreateForm: React.FC<Props> = ({ onCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [choices, setChoices] = useState<string[]>(['Option 1', 'Option 2']);
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  const updateChoice = (idx: number, value: string) => {
    setChoices(prev => prev.map((c, i) => i === idx ? value : c));
  };

  const addChoice = () => setChoices(prev => [...prev, `Option ${prev.length + 1}`]);
  const removeChoice = (idx: number) => setChoices(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || choices.length < 2) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        choices: choices.map(label => ({ label })),
        startAt: startAt || undefined,
        endAt: endAt || undefined,
        allowAnonymous
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label>Description</Label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md" rows={3} />
      </div>

      <div>
        <Label>Choices</Label>
        <div className="space-y-2">
          {choices.map((c, idx) => (
            <div key={idx} className="flex gap-2">
              <Input value={c} onChange={(e) => updateChoice(idx, e.target.value)} />
              {choices.length > 2 && (
                <Button type="button" variant="destructive" onClick={() => removeChoice(idx)}>Remove</Button>
              )}
            </div>
          ))}
          <div>
            <Button type="button" onClick={addChoice}>Add Choice</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start At</Label>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </div>
        <div>
          <Label>End At</Label>
          <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input id="anon" type="checkbox" checked={allowAnonymous} onChange={(e) => setAllowAnonymous(e.target.checked)} />
        <Label htmlFor="anon">Allow anonymous voting</Label>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Poll'}</Button>
      </div>
    </form>
  );
};

export default PollCreateForm;
