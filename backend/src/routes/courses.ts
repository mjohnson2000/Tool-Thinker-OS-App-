import express, { Request, Response } from 'express';
import { Course } from '../models/Course';
import { UserProgress } from '../models/UserProgress';
import { Coach } from '../models/Coach';
import auth from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    isSubscribed: boolean;
  };
}

const router = express.Router();

// Get all published courses with filtering
router.get('/', async (req, res) => {
  try {
    const { category, level, instructor, sortBy = 'rating' } = req.query;
    
    let query: any = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (instructor) {
      query.instructor = instructor;
    }
    
    let sortQuery: any = {};
    switch (sortBy) {
      case 'rating':
        sortQuery = { rating: -1, totalStudents: -1 };
        break;
      case 'price':
        sortQuery = { price: 1 };
        break;
      case 'duration':
        sortQuery = { duration: 1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { rating: -1 };
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name bio rating totalReviews')
      .sort(sortQuery);
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID with instructor details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name bio rating totalReviews expertise');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new course (requires coach auth)
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { title, description, category, level, duration, price, modules, tags } = req.body;
    
    // Check if user is a coach
    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
      return res.status(403).json({ message: 'Only coaches can create courses' });
    }
    
    const course = new Course({
      title,
      description,
      instructor: coach._id,
      category,
      level,
      duration,
      price,
      modules,
      tags
    });
    
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course (requires coach auth)
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const course = await Course.findById(req.params.id).populate('instructor');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Ensure user is the course instructor
    const coach = course.instructor as any;
    if (coach.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in a course
router.post('/:id/enroll', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const course = await Course.findById(req.params.id);
    if (!course || !course.isPublished) {
      return res.status(404).json({ message: 'Course not available' });
    }
    
    // Check if user is already enrolled
    const existingProgress = await UserProgress.findOne({
      userId: req.user.id,
      courseId: course._id
    });
    
    if (existingProgress) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Create progress tracking
    const progress = new UserProgress({
      userId: req.user.id,
      courseId: course._id,
      moduleProgress: course.modules.map((_, index) => ({
        moduleId: index + 1,
        completed: false,
        timeSpent: 0
      }))
    });
    
    await progress.save();
    
    // Update course student count
    course.totalStudents += 1;
    await course.save();
    
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's course progress
router.get('/:id/progress', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const progress = await UserProgress.findOne({
      userId: req.user.id,
      courseId: req.params.id
    }).populate('courseId');
    
    if (!progress) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update module progress
router.patch('/:id/progress/:moduleId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { completed, timeSpent, quizScore } = req.body;
    const moduleId = parseInt(req.params.moduleId);
    
    const progress = await UserProgress.findOne({
      userId: req.user.id,
      courseId: req.params.id
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }
    
    // Find and update the specific module
    const moduleProgress = progress.moduleProgress.find(m => m.moduleId === moduleId);
    if (moduleProgress) {
      if (completed !== undefined) {
        moduleProgress.completed = completed;
        if (completed) {
          moduleProgress.completedAt = new Date();
        }
      }
      if (timeSpent !== undefined) {
        moduleProgress.timeSpent = timeSpent;
      }
      if (quizScore !== undefined) {
        moduleProgress.quizScore = quizScore;
      }
    }
    
    // Update overall progress
    const completedModules = progress.moduleProgress.filter(m => m.completed).length;
    progress.overallProgress = Math.round((completedModules / progress.moduleProgress.length) * 100);
    progress.lastAccessedAt = new Date();
    
    // Check if course is completed
    if (progress.overallProgress === 100 && !progress.completedAt) {
      progress.completedAt = new Date();
      progress.certificateEarned = true;
      // In a real app, you'd generate a certificate here
      progress.certificateUrl = `/certificates/${progress._id}.pdf`;
    }
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's enrolled courses
router.get('/user/enrolled', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const progress = await UserProgress.find({ userId: req.user.id })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructor',
          select: 'name bio rating'
        }
      })
      .sort({ lastAccessedAt: -1 });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get coach's courses
router.get('/coach/courses', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const coach = await Coach.findOne({ userId: req.user.id });
    if (!coach) {
      return res.status(403).json({ message: 'Not a coach' });
    }
    
    const courses = await Course.find({ instructor: coach._id })
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 