import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HomeContext from '@/pages/api/home/home.context';

import cl100k_base from 'tiktoken/encoders/cl100k_base.json';
import { Tiktoken } from 'tiktoken/lite';

export function ChatInputTokenCount(props: { content: string | undefined }) {
  const { t } = useTranslation('chat');
  const {
    state: { selectedConversation },
  } = useContext(HomeContext);

  const [tokenizer, setTokenizer] = useState<Tiktoken | null>(null);

  useEffect(() => {
    let model: Tiktoken | null = new Tiktoken(
      cl100k_base.bpe_ranks,
      {
        ...cl100k_base.special_tokens,
        '<|im_start|>': 100264,
        '<|im_end|>': 100265,
        '<|im_sep|>': 100266,
      },
      cl100k_base.pat_str,
    );

    setTokenizer(model);
    return () => model?.free();
  }, []);

  const serialized = `${props.content || ''}`;
  const count = tokenizer?.encode(serialized, 'all').length;
  if (count == null) return null;
  return (
    <div className="py-1 px-2 text-neutral-400 pointer-events-auto text-xs">
      {t('{{count}} tokens', {
        count,
      })}
    </div>
  );
}
