const lessons = require('./firstConversationVideos.json');

module.exports = {
  lessons: lessons.map(lesson => {
    const id = lesson.youtubeId;
    if (id !== null && !/^[A-Za-z0-9_-]{11}$/.test(id)) {
      throw new Error(`Lesson ${lesson.number}: use a verified YouTube video ID or null.`);
    }
    return {
      ...lesson,
      duration: `${Math.floor(lesson.seconds / 60)}:${String(lesson.seconds % 60).padStart(2, '0')}`,
      watchUrl: id ? `https://www.youtube.com/watch?v=${id}` : null,
    };
  }),
};
