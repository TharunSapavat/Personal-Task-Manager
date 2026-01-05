const User = require('../models/UserModel');

// Collection of motivational quotes
const motivationalQuotes = [
  { text: "Pray as if everything depends on God. Work as if everything depends on you.", author: "Saint Augustine" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "God didn’t bring you this far to leave you.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Work hard in silence. Let success make the noise.", author: "Frank Ocean" },
  { text: "Trust the process. God’s timing is always perfect.", author: "Unknown" },
  { text: "Dreams don’t work unless you do.", author: "John C. Maxwell" },
  { text: "When you feel like quitting, remember why you prayed for it.", author: "Unknown" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "God gives strength to the weary and increases the power of the weak.", author: "Isaiah 40:29" },

  { text: "Success is built on consistency, not motivation.", author: "Unknown" },
  { text: "Pray, work hard, stay humble.", author: "Unknown" },
  { text: "Don’t stop when you’re tired. Stop when you’re done.", author: "Unknown" },
  { text: "Faith makes things possible, not easy.", author: "Unknown" },
  { text: "You are one decision away from a completely different life.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn’t work hard.", author: "Tim Notke" },
  { text: "God sees the effort you put in, even when no one else does.", author: "Unknown" },
  { text: "One day of discipline can change your entire future.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Commit your work to the Lord, and your plans will succeed.", author: "Proverbs 16:3" },

  { text: "Your future self is watching you right now.", author: "Unknown" },
  { text: "Prayer fuels purpose.", author: "Unknown" },
  { text: "Focus on progress, not perfection.", author: "Unknown" },
  { text: "God is preparing you for what you prayed for.", author: "Unknown" },
  { text: "Late nights and early mornings build greatness.", author: "Unknown" },
  { text: "Work like it depends on you. Pray like it depends on God.", author: "Unknown" },
  { text: "Consistency turns average into excellence.", author: "Unknown" },
  { text: "The grind is silent before the success is loud.", author: "Unknown" },
  { text: "Faith over fear. Always.", author: "Unknown" },
  { text: "Every effort you make today is an investment in tomorrow.", author: "Unknown" },

  { text: "You prayed for this opportunity. Don’t waste it.", author: "Unknown" },
  { text: "God never wastes your struggles.", author: "Unknown" },
  { text: "Stay patient and trust your journey.", author: "Unknown" },
  { text: "Your work ethic is your prayer in action.", author: "Unknown" },
  { text: "Push yourself even when no one is watching.", author: "Unknown" },
  { text: "The discipline you build today creates the freedom you want tomorrow.", author: "Unknown" },
  { text: "God strengthens those who keep moving forward.", author: "Unknown" },
  { text: "Success starts with showing up every day.", author: "Unknown" },
  { text: "Prayer gives peace. Hard work gives progress.", author: "Unknown" },
  { text: "What you do daily matters more than what you do occasionally.", author: "Unknown" },

  { text: "Don’t complain. Work harder. Pray stronger.", author: "Unknown" },
  { text: "God’s plans are always bigger than your fears.", author: "Unknown" },
  { text: "Consistency is a form of faith.", author: "Unknown" },
  { text: "Do today what others won’t, so tomorrow you can live how others can’t.", author: "Unknown" },
  { text: "Prayer keeps you grounded while ambition lifts you higher.", author: "Unknown" },
  { text: "Hard work is a form of gratitude.", author: "Unknown" },
  { text: "Trust God. Do the work. Stay patient.", author: "Unknown" },
  { text: "Success comes to those who refuse to stop.", author: "Unknown" },
  { text: "Your effort today is tomorrow’s blessing.", author: "Unknown" },
  { text: "God rewards consistency, not comfort.", author: "Unknown" },

  { text: "Wake up. Pray. Work. Repeat.", author: "Unknown" },
  { text: "Every setback is a setup for something better.", author: "Unknown" },
  { text: "God’s timing is worth the wait.", author: "Unknown" },
  { text: "Discipline is self-love.", author: "Unknown" },
  { text: "Your prayers and your persistence work together.", author: "Unknown" },
  { text: "Work hard today so your prayers have space to grow.", author: "Unknown" },
  { text: "Success is rented, and rent is due every day.", author: "Unknown" },
  { text: "God gives strength to those who keep going.", author: "Unknown" },
  { text: "Stay humble, stay hungry, stay faithful.", author: "Unknown" },
  { text: "Effort plus faith equals growth.", author: "Unknown" },

  { text: "You don’t need motivation. You need discipline.", author: "Unknown" },
  { text: "Pray for strength, then work like you received it.", author: "Unknown" },
  { text: "God honors effort done with sincerity.", author: "Unknown" },
  { text: "Your work today is shaping your destiny.", author: "Unknown" },
  { text: "Consistency is the prayer of action.", author: "Unknown" },
  { text: "Trust God, but tie your camel.", author: "Prophet Muhammad (PBUH)" },
  { text: "Faith gives meaning to effort.", author: "Unknown" },
  { text: "Work hard now. Thank yourself later.", author: "Unknown" },
  { text: "God’s favor follows discipline.", author: "Unknown" },
  { text: "Show up every day. God does the rest.", author: "Unknown" }
];


// Get daily quote for user
exports.getDailyQuote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('lastQuoteShownDate currentQuoteIndex');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Check if quote was already shown today
    if (user.lastQuoteShownDate === todayString) {
      return res.status(200).json({
        success: true,
        showQuote: false,
        message: 'Quote already shown today'
      });
    }

    // Get next quote (cycle through the array)
    const quoteIndex = (user.currentQuoteIndex || 0) % motivationalQuotes.length;
    const quote = motivationalQuotes[quoteIndex];

    // Update user's quote tracking
    user.lastQuoteShownDate = todayString;
    user.currentQuoteIndex = (quoteIndex + 1) % motivationalQuotes.length;
    await user.save();

    res.status(200).json({
      success: true,
      showQuote: true,
      quote: {
        text: quote.text,
        author: quote.author,
        index: quoteIndex + 1,
        total: motivationalQuotes.length
      }
    });
  } catch (err) {
    console.error('Get daily quote error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily quote'
    });
  }
};

// Get all quotes (optional - for admin/testing)
exports.getAllQuotes = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      quotes: motivationalQuotes,
      total: motivationalQuotes.length
    });
  } catch (err) {
    console.error('Get all quotes error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes'
    });
  }
};
