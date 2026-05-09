import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import CardEditor from './CardEditor';
import { baseUrl } from '../lib/base-url';

interface CardConfig {
  id: number;
  card_name: string;
  card_type: string;
  slots: Array<{
    slotName: string;
    metricId: number | null;
    label?: string;
  }>;
  created_at: string;
}

export default function CardManager() {
  const [cards, setCards] = useState<CardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState<CardConfig | undefined>();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/card-configs`);
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card: CardConfig) => {
    setEditingCard(card);
    setShowEditor(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this card configuration?')) return;

    try {
      const res = await fetch(`${baseUrl}/api/admin/card-configs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        loadCards();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingCard(undefined);
    loadCards();
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingCard(undefined);
  };

  if (showEditor) {
    return (
      <CardEditor
        onSave={handleSave}
        onCancel={handleCancel}
        existingConfig={editingCard}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Cards</h2>
          <p className="text-muted-foreground">
            Configure cards with metric assignments for the dashboard
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          + New Card
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading cards...
          </CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No cards configured yet</p>
            <Button onClick={() => setShowEditor(true)}>
              Create Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Cards ({cards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Metrics Assigned</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map(card => {
                  const assignedCount = card.slots.filter(s => s.metricId !== null).length;
                  
                  return (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.card_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{card.card_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {assignedCount} / {card.slots.length} slots
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(card.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(card)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(card.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
