const Profile = require('../../models/profile');

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save image buffer and mimetype directly in MongoDB
    const update = {
      profilePicture: '', // no local path
      profilePictureData: req.file.buffer,
      profilePictureType: req.file.mimetype || 'application/octet-stream',
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      update,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      // return metadata only; actual binary can be served via a separate route if needed
      message: 'Profile picture uploaded successfully',
      mimeType: update.profilePictureType,
      size: req.file.size,
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile || (!profile.profilePicture && !profile.profilePictureData)) {
      return res.status(404).json({ message: 'No profile picture found' });
    }

    // Update profile to remove picture data
    await Profile.findOneAndUpdate(
      { userId: req.userId },
      { profilePicture: '', profilePictureData: undefined, profilePictureType: '' }
    );

    res.json({ success: true, message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ message: 'Failed to delete profile picture' });
  }
};

// Get profile picture (binary)
const getProfilePicture = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile || !profile.profilePictureData || !profile.profilePictureType) {
      return res.status(404).json({ message: 'No profile picture found' });
    }

    res.set('Content-Type', profile.profilePictureType);
    res.set('Content-Length', String(profile.profilePictureData.length));
    // Optional caching headers (adjust as needed)
    res.set('Cache-Control', 'private, max-age=300');
    return res.status(200).send(profile.profilePictureData);
  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile picture' });
  }
};

module.exports = { uploadProfilePicture, deleteProfilePicture, getProfilePicture };
