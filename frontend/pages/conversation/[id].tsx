import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { useTranslation } from 'next-i18next';
import MarkdownDisplay from '@/components/Chat/MarkDownDisplay';
import Avatar from '@/components/Imagepicker/Avatar';
import Link from 'next/link';

const ConversationPage: React.FC = () => {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const { id } = router.query;

  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      setConversationId(id);
    }
  }, [id]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  const { data: conversation, isLoading, error } = trpc.conversations.getById.useQuery(
    { id: conversationId || '' },
    { enabled: !!conversationId }
  );

  if (isLoading) return <p>{t('Loading...')}</p>;

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <img src="/images/ragverse-logo.png" alt="RAGVerse Logo" className="h-10 w-auto" />
          {/* Titles */}
          <div>
            <h1 className="text-3xl font-bold">{t('RAGVerse')}</h1>
            <h2 className="text-lg font-medium text-gray-400">{t('Shared Conversations')}</h2>
          </div>
        </div>

        {/* Link Button */}
        <Link
          href="https://ourvedas.in"
          passHref
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#38b2ac',
            color: '#ffffff',
            padding: '12px 24px',
            fontSize: '1.1em',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'background-color 0.3s, transform 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2c7a7b';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#38b2ac';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Start Knowing...
        </Link>
      </header>

      {/* Conversation Content or No Conversation Found */}
      {error || !conversation ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">{t('Conversation not found')}</h2>
          <p className="text-gray-400">{t('The conversation you are looking for does not exist or has been removed.')}</p>
        </div>
      ) : (
        conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`border p-4 rounded mb-4 ${message.role === 'assistant' ? 'bg-gray-800' : 'bg-gray-700'}`}
          >
            <div className="flex items-start gap-4">
              <Avatar username={message.role === 'assistant' ? 'Assistant' : 'User'} size={40} />
              <div className="flex-1">
                <div className="text-gray-100">
                  {message.role === 'assistant' ? (
                    <span>{message.content}</span>
                  ) : (
                    <MarkdownDisplay inputText={message.content} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationPage;
