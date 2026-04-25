/**
 * LLM Client Wrapper
 * Supports Anthropic (Claude) and OpenAI APIs
 */

const https = require('https');
const config = require('../config');

class LLMClient {
  constructor(provider = 'anthropic') {
    this.provider = provider;
    this.apiKey = provider === 'anthropic' 
      ? config.llm.anthropicApiKey 
      : config.llm.openaiApiKey;
    
    if (!this.apiKey) {
      throw new Error(`No API key found for ${provider}. Set ${provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'} environment variable.`);
    }
  }

  /**
   * Complete a prompt with the LLM
   */
  async complete(prompt, options = {}) {
    const model = options.model || config.llm.skillModel;
    const timeout = options.timeout || config.llm.skillTimeout;
    
    if (this.provider === 'anthropic') {
      return this._anthropicComplete(prompt, model, timeout);
    } else {
      return this._openaiComplete(prompt, model, timeout);
    }
  }

  /**
   * Anthropic API call
   */
  async _anthropicComplete(prompt, model, timeout) {
    const data = JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.0, // Deterministic for evals
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: timeout,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.error) {
              reject(new Error(`Anthropic API error: ${parsed.error.message}`));
            } else {
              resolve(parsed.content[0].text);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * OpenAI API call
   */
  async _openaiComplete(prompt, model, timeout) {
    const data = JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.0,
      max_tokens: 4096,
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: timeout,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.error) {
              reject(new Error(`OpenAI API error: ${parsed.error.message}`));
            } else {
              resolve(parsed.choices[0].message.content);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(data);
      req.end();
    });
  }
}

module.exports = { LLMClient };
