import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select(`
          id,
          task_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            nome,
            avatar_url
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const formattedComments = (commentsData || []).map((item: any) => ({
        id: item.id,
        task_id: item.task_id,
        user_id: item.user_id,
        user_name: item.profiles?.nome || 'Usuário',
        user_avatar: item.profiles?.avatar_url,
        content: item.content,
        created_at: item.created_at
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os comentários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Erro',
        description: 'O comentário não pode estar vazio',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content: comment.trim()
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Comentário adicionado com sucesso'
      });

      setComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-4 text-sm text-muted-foreground">
          Nenhum comentário para esta tarefa
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.user_avatar} />
                <AvatarFallback>
                  {item.user_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-sm">
                    {item.user_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Adicione um comentário..."
          className="min-h-[80px] flex-1"
        />
        <Button 
          onClick={handleAddComment} 
          disabled={submitting || !comment.trim()}
          className="self-end"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
