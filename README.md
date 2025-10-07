# Photo Metadata Remover

A secure, privacy-focused web application that removes EXIF metadata from JPEG photos directly in your browser.

Photo Metadata Remover: https://andrewsink.github.io/photo-metadata-remover/

<img width="1281" height="894" alt="image" src="https://github.com/user-attachments/assets/e77243d3-7569-413b-97ed-c42077c83d33" />


## 🔒 Privacy First

- **100% Local Processing** - Your photos never leave your device
- **No Uploads** - All processing happens in your browser
- **No Data Collection** - We don't store or track anything
- **Open Source** - Full transparency in how your data is handled

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
- Camera owner information
- Software information

### Technical Properties
- Camera make and model
- Camera settings (ISO, aperture, etc.)
- Image dimensions and resolution
- Color space information

## 🔧 How It Works

1. **Upload** your JPEG photo using drag & drop
2. **Review** the metadata found in your image
3. **Select** which data you want to remove
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
