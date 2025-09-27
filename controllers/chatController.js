const OpenAI = require('openai');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const handleChat = async (req, res) => {
  const { query, data } = req.body;

  if (!query) {
    logger.warn('Chat request missing query');
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    logger.error('OpenAI API key not configured');
    return res.status(500).json({ error: 'API configuration error' });
  }

  try {
    logger.debug(`Processing chat query: "${query}" with data length: ${data ? data.length : 0}`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: `You are Drill AI, an expert in oil drilling data analysis. Use the provided well data to answer questions accurately. Data: ${JSON.stringify(data || [])}. If no data is provided, say so.` 
        },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content.trim();
    logger.info('Chat response generated successfully');
    res.status(200).json({ response });
  } catch (error) {
    logger.error('Chat error:', error);
    let errorMsg = 'Chat failed';
    if (error.response) {
      errorMsg += `: ${error.response.status} - ${error.response.data.error.message}`;
    } else {
      errorMsg += `: ${error.message}`;
    }
    res.status(500).json({ error: errorMsg });
  }
};

module.exports = { handleChat };