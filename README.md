# Photo Metadata Remover

A secure, privacy-focused web application that removes EXIF metadata from JPEG photos directly in your browser.

Photo Metadata Remover: https://andrewsink.github.io/photo-metadata-remover/

<img width="1262" height="868" alt="image" src="https://github.com/user-attachments/assets/85c67560-9fa1-45bf-b2bf-e6dbdc26b4fb" />

## 🔒 Privacy First

- **100% Local Processing** - Your photos never leave your device
- **No Cloud Uploads** - All processing happens in your browser
- **No Data Collection** - Nothing is stored or tracked

## ✨ Features

- **Drag & Drop Interface** - Easy photo upload
- **Metadata Viewer** - See exactly what data is in your photos
- **Selective Removal** - Choose which metadata to remove
- **Instant Download** - Get your cleaned photos immediately
- **Mobile Friendly** - Works on all devices

## 📸 Supported Formats

- JPEG (.jpg, .jpeg)

## 🛡️ What Gets Removed

### Sensitive Data
- GPS coordinates and location information
- Date and time stamps
- Camera make and model
- Camera owner information
- Software information

### Technical Properties
- Camera settings (ISO, aperture, etc.)
- Image dimensions and resolution
- Color space information

## 🔧 How It Works

1. **Upload** your JPEG photo using drag & drop
2. **Review** the metadata found in your image
4. **Download** your cleaned image

## 💻 Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses the EXIF.js library for metadata extraction
- Canvas API for metadata removal
- No server-side processing required

## 🤝 Contributing

This is an open-source project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this code for your own projects.

## 👨‍💻 Author

Created by [Andrew Sink](https://andrewsink.xyz)

---

**Note**: This tool removes metadata by re-encoding the image through HTML5 Canvas, which strips all EXIF data. For maximum privacy, always verify your cleaned images before sharing.
