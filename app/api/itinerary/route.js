import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `You are a friendly travel itinerary assistant for Nomads Journal, a social platform for travelers. When a user mentions a city or destination, give them a concise practical day-by-day itinerary with must-see spots, local food tips, and budget hints. Keep responses warm, brief (under 150 words), and use a few emojis. If they don't mention a city, ask them which city they want to visit.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const reply = response.choices[0]?.message?.content || "Couldn't generate itinerary. Try again!";

    return Response.json({ reply });

  } catch (error) {
    console.error('Groq API error:', error);
    return Response.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}