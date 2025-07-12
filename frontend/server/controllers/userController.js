import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { Achievement } from '../models/Community.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, grade } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (grade) filter.grade = grade;

    const users = await User.find(filter)
      .select('-password')
      .populate('children', 'name email grade')
      .populate('parentId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('children', 'name email grade')
      .populate('parentId', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { name, email, grade, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        grade,
        preferences
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user progress
// @route   GET /api/users/:id/progress
// @access  Private
export const getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.params.id })
      .sort({ lastAccessed: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user achievements
// @route   GET /api/users/:id/achievements
// @access  Private
export const getUserAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      'earnedBy.user': req.params.id
    });

    res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};