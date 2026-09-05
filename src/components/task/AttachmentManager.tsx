'use client';

import React, { useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addAttachment, removeAttachment } from '@/store/slices/taskSlice';
import { storeAttachmentInIDB, removeAttachmentFromIDB } from '@/services/storageService';
import { Attachment } from '@/types/task';
import { useToast } from '@/components/ui/Toast';
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileCode,
  Download,
  Trash2,
  Upload,
} from 'lucide-react';

interface AttachmentManagerProps {
  taskId: string;
  attachments: Attachment[];
}

export function AttachmentManager({ taskId, attachments }: AttachmentManagerProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Limit client simulation file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('File Too Large', `${file.name} exceeds 10MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          taskId,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          createdAt: new Date().toISOString(),
        };

        // 1. Store in IndexedDB for heavy file persistence
        await storeAttachmentInIDB(newAttachment);

        // 2. Dispatch to Redux state
        dispatch(addAttachment({ taskId, attachment: newAttachment }));
        toast.success('Attached File', file.name);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    await removeAttachmentFromIDB(attachmentId);
    dispatch(removeAttachment({ taskId, attachmentId }));
    toast.info('Attachment Removed');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (type.includes('json') || type.includes('javascript') || type.includes('typescript'))
      return <FileCode className="w-4 h-4 text-amber-500" />;
    return <FileText className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" />
          <span>Attachments ({attachments.length})</span>
        </span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <Upload className="w-3 h-3" />
          Upload file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30"
        >
          <Paperclip className="w-5 h-5 mx-auto mb-1 opacity-40" />
          <p>Click or drag files here to attach locally</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att) => {
            const isImage = att.type.startsWith('image/');
            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isImage && att.dataUrl ? (
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getFileIcon(att.type)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate" title={att.name}>
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatFileSize(att.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a
                    href={att.dataUrl}
                    download={att.name}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(att.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
