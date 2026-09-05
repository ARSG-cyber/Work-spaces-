'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addComment, updateComment, deleteComment } from '@/store/slices/commentSlice';
import { logActivity } from '@/store/slices/activitySlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { showAccessDenied } from '@/store/slices/uiSlice';
import { Comment } from '@/types/comment';
import { Avatar } from '@/components/common/Avatar';
import { useToast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { Send, Edit2, Trash2, Check, X, MessageSquare, AtSign } from 'lucide-react';

interface CommentThreadProps {
  taskId: string;
  taskTitle: string;
  projectId: string;
  workspaceId: string;
}

export function CommentThread({
  taskId,
  taskTitle,
  projectId,
  workspaceId,
}: CommentThreadProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const comments = useAppSelector((s) => s.comment.comments[taskId] || []);
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const activeWorkspace = useAppSelector((s) => s.workspace.workspaces[workspaceId]);

  const [text, setText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // @mention state
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionCursorPos, setMentionCursorPos] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter members for mention
  const workspaceUsers = mockUsers.filter((u) =>
    activeWorkspace?.members.some((m) => m.userId === u.id)
  );

  const filteredMentions = workspaceUsers.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setText(val);

    // Detect @ symbol immediately preceding cursor
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1 && !textBeforeCursor.slice(lastAtIdx).includes(' ')) {
      setMentionQuery(textBeforeCursor.slice(lastAtIdx + 1));
      setShowMentions(true);
      setMentionCursorPos(lastAtIdx);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (userName: string, userId: string) => {
    if (mentionCursorPos === null) return;
    const before = text.slice(0, mentionCursorPos);
    const after = text.slice(textareaRef.current?.selectionStart || text.length);
    const inserted = `${before}@${userName} ${after}`;
    setText(inserted);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    if (currentUser.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'post comments' }));
      return;
    }

    // Extract mentions
    const mentionedUserIds: string[] = [];
    workspaceUsers.forEach((u) => {
      if (text.includes(`@${u.name}`) && u.id !== currentUser.id) {
        mentionedUserIds.push(u.id);
      }
    });

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      taskId,
      authorId: currentUser.id,
      content: text.trim(),
      mentions: mentionedUserIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addComment(newComment));

    dispatch(
      logActivity({
        id: `act-${Date.now()}`,
        taskId,
        taskTitle,
        projectId,
        workspaceId,
        actorId: currentUser.id,
        actionType: 'comment_added',
        details: 'commented on task',
        timestamp: new Date().toISOString(),
      })
    );

    // Generate in-app notifications for mentioned users
    mentionedUserIds.forEach((targetUserId) => {
      dispatch(
        addNotification({
          id: `notif-${Date.now()}-${targetUserId}`,
          userId: targetUserId,
          title: 'Mentioned in Comment',
          message: `${currentUser.name} mentioned you in "${taskTitle}"`,
          type: 'mention',
          taskId,
          projectId,
          workspaceId,
          read: false,
          createdAt: new Date().toISOString(),
        })
      );
    });

    setText('');
    setShowMentions(false);
    toast.success('Comment Posted');
  };

  const handleSaveEdit = (commentId: string) => {
    if (editingContent.trim()) {
      dispatch(updateComment({ taskId, commentId, content: editingContent.trim() }));
      toast.info('Comment Updated');
    }
    setEditingCommentId(null);
  };

  const handleDelete = (commentId: string) => {
    dispatch(deleteComment({ taskId, commentId }));
    toast.info('Comment Deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No comments yet. Type below to start a discussion.
          </p>
        ) : (
          comments.map((comm) => {
            const author = mockUsers.find((u) => u.id === comm.authorId);
            const isOwn = comm.authorId === currentUser?.id;
            const isEditing = editingCommentId === comm.id;

            return (
              <div
                key={comm.id}
                className="group flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs"
              >
                <Avatar
                  name={author?.name || 'User'}
                  avatar={author?.avatar}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {author?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(comm.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {isOwn && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comm.id);
                            setEditingContent(comm.content);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                          title="Edit comment"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comm.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-1.5">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comm.id)}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-medium"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-600 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {comm.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/30">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={handleTextChange}
            placeholder="Write a comment... (Type @ to mention teammates)"
            className="w-full p-3 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <AtSign className="w-3 h-3 text-slate-400" />
              <span>Type @ to mention</span>
            </span>

            <button
              type="submit"
              disabled={!text.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                text.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* @Mention Autocomplete Dropdown */}
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Mention Teammate
            </div>
            <div className="max-h-40 overflow-y-auto p-1">
              {filteredMentions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectMention(user.name, user.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-left"
                >
                  <Avatar name={user.name} avatar={user.avatar} size="xs" />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold block truncate">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize block truncate">
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
