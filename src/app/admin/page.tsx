'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, Music, Plus, Trash2, Edit } from 'lucide-react';

interface Song {
  _id?: string;
  title: string;
  artist: string;
  src: string;
  cover: string;
  emotion: string;
}

export default function AdminPanel() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    src: '',
    cover: '',
    emotion: ''
  });
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Fetch all songs
  const fetchSongs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/songs');
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      } else {
        setMessage('Failed to fetch songs');
      }
    } catch (error) {
      setMessage('Error fetching songs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle edit
  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      src: song.src,
      cover: song.cover,
      emotion: song.emotion
    });
  };

  // Handle form submission (both add and edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const method = editingSong ? 'PUT' : 'POST';
      const url = editingSong ? `/api/admin/songs/${editingSong._id}` : '/api/admin/songs';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage(editingSong ? 'Song updated successfully!' : 'Song added successfully!');
        setFormData({ title: '', artist: '', src: '', cover: '', emotion: '' });
        setEditingSong(null);
        fetchSongs(); // Refresh the list
      } else {
        const error = await response.json();
        setMessage(error.error || `Failed to ${editingSong ? 'update' : 'add'} song`);
      }
    } catch (error) {
      setMessage(`Error ${editingSong ? 'updating' : 'adding'} song`);
    }
    setLoading(false);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingSong(null);
    setFormData({ title: '', artist: '', src: '', cover: '', emotion: '' });
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/songs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Song deleted successfully!');
        fetchSongs(); // Refresh the list
      } else {
        setMessage('Failed to delete song');
      }
    } catch (error) {
      setMessage('Error deleting song');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MoodyO Admin Panel</h1>
          <p className="text-gray-300">Manage your music database</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Song Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {editingSong ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingSong ? 'Edit Song' : 'Add New Song'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="artist" className="text-white">Artist</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="src" className="text-white">Audio URL</Label>
                  <Input
                    id="src"
                    type="url"
                    value={formData.src}
                    onChange={(e) => setFormData({...formData, src: e.target.value})}
                    required
                    placeholder="https://example.com/song.mp3"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="cover" className="text-white">Cover Image URL</Label>
                  <Input
                    id="cover"
                    type="url"
                    value={formData.cover}
                    onChange={(e) => setFormData({...formData, cover: e.target.value})}
                    required
                    placeholder="https://example.com/cover.jpg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="emotion" className="text-white">Mood</Label>
                  <Select value={formData.emotion} onValueChange={(value: string) => setFormData({...formData, emotion: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="joyful">Joyful</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="depression">Depression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Song
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Songs List */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5" />
                All Songs ({songs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && songs.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {songs.map((song) => (
                    <div key={song._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-gray-300 text-sm truncate">{song.artist}</p>
                        <p className="text-purple-300 text-xs capitalize">{song.emotion}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(song)}
                          className="bg-white/5 border-white/20 hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => song._id && handleDelete(song._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {songs.length === 0 && !loading && (
                    <p className="text-gray-400 text-center py-8">No songs found. Add your first song!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message */}
        {message && (
          <Alert className="mt-8 bg-white/10 border-white/20">
            <AlertDescription className="text-white">
              {message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
