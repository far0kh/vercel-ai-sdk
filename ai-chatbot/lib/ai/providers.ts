import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider =
customProvider({
  languageModels: {
    'chat-model': google('gemini-2.0-flash'),
    // 'chat-model-reasoning': google('gemini-2.0-flash'),
    'chat-model-reasoning': wrapLanguageModel({
      model: google('gemini-2.0-flash'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': google('gemini-2.0-flash'),
    'artifact-model': google('gemini-2.0-flash'),
  },
  imageModels: {
    'small-model': google('gemini-2.0-flash-exp-image-generation') as any,
  },
});

export const myProviderDefault = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': xai('grok-2-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });
