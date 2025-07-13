const { Lesson, UserProgress } = require('../models');

class LessonService {
  // Pre-defined lesson templates for different topics
  static lessonTemplates = {
    tactics: {
      pins: {
        title: "Tactical Pins",
        description: "Learn to identify and use pins to immobilize your opponent's pieces",
        objectives: ["Identify absolute pins", "Identify relative pins", "Create pins in your games"],
        positions: [
          {
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
            description: "White's bishop pins the knight to the king",
            concept: "absolute_pin",
            interactive: true,
            instruction: "Look at this position. Can you spot the pin? The black knight on f6 cannot move!"
          }
        ]
      }
    },
    openings: {
      center_control: {
        title: "Center Control Principles",
        description: "Learn why controlling the center is crucial in chess openings",
        objectives: ["Control center squares", "Develop with purpose"],
        positions: [
          {
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            description: "Starting position",
            concept: "opening_start",
            interactive: true,
            instruction: "Let's start with the basic opening principle: control the center! Try moving e2-e4."
          }
        ]
      }
    }
  };

  static async createLesson(topic, subtopic, difficulty = 'beginner') {
    const template = this.lessonTemplates[topic]?.[subtopic];
    if (!template) {
      throw new Error(`Lesson template not found for ${topic}:${subtopic}`);
    }

    try {
      const lesson = await Lesson.create({
        title: template.title,
        topic: topic,
        difficulty: difficulty,
        description: template.description,
        objectives: template.objectives,
        positions: template.positions
      });

      return lesson;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  static async startLesson(userId, lessonId, conversationId = null) {
    try {
      let progress = await UserProgress.findOne({
        where: { userId, lessonId }
      });

      if (!progress) {
        progress = await UserProgress.create({
          userId,
          lessonId,
          conversationId,
          status: 'in_progress',
          currentStep: 'introduction',
          startedAt: new Date()
        });
      } else {
        progress.status = 'in_progress';
        progress.conversationId = conversationId;
        await progress.save();
      }

      return progress;
    } catch (error) {
      console.error('Error starting lesson:', error);
      throw error;
    }
  }

  static async updateProgress(userId, lessonId, updateData) {
    try {
      const progress = await UserProgress.findOne({
        where: { userId, lessonId }
      });

      if (!progress) {
        throw new Error('Progress record not found');
      }

      Object.assign(progress, updateData);
      
      const lesson = await Lesson.findByPk(lessonId);
      if (lesson && lesson.positions) {
        const totalSteps = lesson.positions.length;
        const completedSteps = progress.completedSteps.length;
        progress.progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      }

      await progress.save();
      return progress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  static async getUserProgress(userId, lessonId = null) {
    try {
      const where = { userId };
      if (lessonId) {
        where.lessonId = lessonId;
      }

      const progress = await UserProgress.findAll({
        where,
        include: [{
          model: Lesson,
          as: 'lesson'
        }]
      });

      return progress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  static getAvailableTopics() {
    return Object.keys(this.lessonTemplates).map(topic => ({
      topic,
      subtopics: Object.keys(this.lessonTemplates[topic]).map(subtopic => ({
        subtopic,
        ...this.lessonTemplates[topic][subtopic]
      }))
    }));
  }
}

module.exports = LessonService;
