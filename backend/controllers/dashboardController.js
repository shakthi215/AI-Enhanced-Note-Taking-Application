const Note = require('../models/Note');

// @desc    Get dashboard insights
// @route   GET /api/dashboard/insights
const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalNotes,
      totalWords,
      categoryData,
      tagData,
      recentActivity,
      weeklyData,
      topNotes
    ] = await Promise.all([
      Note.countDocuments({ user: userId, isArchived: { $ne: true } }),
      Note.aggregate([
        { $match: { user: userId, isArchived: { $ne: true } } },
        { $group: { _id: null, totalWords: { $sum: '$wordCount' } } }
      ]),
      Note.aggregate([
        { $match: { user: userId, isArchived: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Note.aggregate([
        { $match: { user: userId, isArchived: { $ne: true } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Note.find({ user: userId, isArchived: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title updatedAt wordCount category'),
      // Notes created in last 7 days
      Note.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Note.find({ user: userId })
        .sort({ viewCount: -1 })
        .limit(3)
        .select('title viewCount category')
    ]);

    const enhancedCount = await Note.countDocuments({ user: userId, isEnhanced: true });
    const pinnedCount = await Note.countDocuments({ user: userId, isPinned: true });
    const archivedCount = await Note.countDocuments({ user: userId, isArchived: true });

    // Build weekly chart data
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = weeklyData.find(d => d._id === dateStr);
      days.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        count: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      insights: {
        overview: {
          totalNotes,
          totalWords: totalWords[0]?.totalWords || 0,
          enhancedNotes: enhancedCount,
          pinnedNotes: pinnedCount,
          archivedNotes: archivedCount,
          avgWordsPerNote: totalNotes > 0 ? Math.round((totalWords[0]?.totalWords || 0) / totalNotes) : 0
        },
        categories: categoryData.map(c => ({ name: c._id || 'Uncategorized', count: c.count })),
        topTags: tagData.map(t => ({ name: t._id, count: t.count })),
        weeklyActivity: days,
        recentNotes: recentActivity,
        topNotes
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getInsights };
