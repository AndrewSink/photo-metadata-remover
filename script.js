// Global variables
let currentImageFile = null;
let currentMetadata = {};
let selectedMetadataToRemove = new Set();

// DOM elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const imageName = document.getElementById('image-name');
const imageSize = document.getElementById('image-size');
const metadataContainer = document.getElementById('metadata-container');
const sensitiveMetadata = document.getElementById('sensitive-metadata');
const propertiesMetadata = document.getElementById('properties-metadata');
const actionButtons = document.getElementById('action-buttons');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const sensitiveMaster = document.getElementById('sensitive-master');
const propertiesMaster = document.getElementById('properties-master');
const scrollToBottomBtn = document.getElementById('scroll-to-bottom');

// Sensitive metadata keys (privacy-related)
const sensitiveKeys = [
    'GPS', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSTimeStamp',
    'GPSDateStamp', 'GPSProcessingMethod', 'GPSAreaInformation',
    'DateTime', 'DateTimeOriginal', 'DateTimeDigitized',
    'UserComment', 'ImageDescription', 'Artist', 'Copyright',
    'CameraOwnerName', 'BodySerialNumber', 'LensSerialNumber',
    'Software', 'ProcessingSoftware', 'HostComputer'
];

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Upload area events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Master checkboxes
    sensitiveMaster.addEventListener('change', handleSensitiveMasterChange);
    propertiesMaster.addEventListener('change', handlePropertiesMasterChange);

    // Action buttons
    downloadBtn.addEventListener('click', downloadCleanedImage);
    resetBtn.addEventListener('click', resetApplication);

    // Scroll to bottom button
    scrollToBottomBtn.addEventListener('click', scrollToBottom);

    // Scroll event listener for showing/hiding the scroll button
    window.addEventListener('scroll', handleScroll);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    // Validate file type - check both MIME type and file extension
    const validTypes = ['image/jpeg', 'image/jpg'];
    const validExtensions = ['.jpg', '.jpeg'];
    const fileName = file.name.toLowerCase();

    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType && !isValidExtension) {
        alert('Please upload a valid JPEG image file (JPG, JPEG)');
        return;
    }

    currentImageFile = file;
    displayImagePreview(file);
    extractMetadata(file);
}

function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        previewImg.src = e.target.result;
        imageName.textContent = file.name;
        imageSize.textContent = formatFileSize(file.size);

        // Show preview
        uploadArea.classList.add('hidden');
        imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function extractMetadata(file) {
    // Show loading state
    metadataContainer.classList.add('loading');

    EXIF.getData(file, function () {
        const allMetadata = EXIF.getAllTags(this);
        currentMetadata = allMetadata;

        // Check if metadata extraction was successful
        if (Object.keys(allMetadata).length === 0) {
            console.warn('No EXIF data found in file:', file.name);
            showMetadataError('No EXIF metadata found in this image. This could be because the image has no metadata or has been previously processed.');
        } else {
            // Process and display metadata
            displayMetadata(allMetadata);
        }

        // Show metadata container and action buttons
        metadataContainer.classList.remove('loading', 'hidden');
        actionButtons.classList.remove('hidden');
    });
}


function showMetadataError(message) {
    sensitiveMetadata.innerHTML = `<div class="metadata-error">${message}</div>`;
    propertiesMetadata.innerHTML = `<div class="metadata-error">${message}</div>`;
}

function displayMetadata(metadata) {
    const sensitiveData = {};
    const propertiesData = {};

    // Categorize metadata, excluding Maker Note entirely
    Object.keys(metadata).forEach(key => {
        // Skip Maker Note completely
        if (key.toLowerCase().includes('maker') || key === 'MakerNote') {
            return;
        }

        if (isSensitiveKey(key)) {
            sensitiveData[key] = metadata[key];
        } else {
            propertiesData[key] = metadata[key];
        }
    });

    // Display sensitive metadata
    displayMetadataGroup(sensitiveData, sensitiveMetadata, 'sensitive');

    // Display properties metadata
    displayMetadataGroup(propertiesData, propertiesMetadata, 'properties');

    // Reset checkboxes
    selectedMetadataToRemove.clear();
    sensitiveMaster.checked = false;
    propertiesMaster.checked = false;
    updateDownloadButtonText();
}

function displayMetadataGroup(data, container, groupType) {
    container.innerHTML = '';

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<div class="empty-state">No metadata found in this category</div>';
        return;
    }

    Object.keys(data).forEach(key => {
        const value = data[key];
        const metadataItem = createMetadataItem(key, value, groupType);
        container.appendChild(metadataItem);
    });
}

function createMetadataItem(key, value, groupType) {
    const item = document.createElement('div');
    item.className = 'metadata-item';

    const formattedValue = formatMetadataValue(key, value);

    item.innerHTML = `
        <div class="metadata-info">
            <div class="metadata-key">${formatMetadataKey(key)}</div>
            <div class="metadata-value">${formattedValue}</div>
        </div>
        <label class="metadata-checkbox">
            <input type="checkbox" data-key="${key}" data-group="${groupType}">
            <span class="checkmark"></span>
        </label>
    `;

    // Add event listener to checkbox
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', handleMetadataCheckboxChange);

    return item;
}

function formatMetadataKey(key) {
    // Convert camelCase to readable format
    return key.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function formatMetadataValue(key, value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    // Handle different data types
    if (typeof value === 'object') {
        if (value.numerator !== undefined && value.denominator !== undefined) {
            // Handle fraction values (like exposure time)
            return `${value.numerator}/${value.denominator}`;
        }
        return JSON.stringify(value);
    }

    // Handle GPS coordinates
    if (key.includes('GPS') && typeof value === 'number') {
        return value.toFixed(6);
    }

    // Handle dates
    if (key.includes('Date') || key.includes('Time')) {
        return value.toString();
    }

    const stringValue = value.toString();

    // Truncate long values
    if (stringValue.length > 100) {
        const truncated = stringValue.substring(0, 100);
        return `${truncated}... <button class="expand-btn" data-full-text="${escapeHtml(stringValue)}" data-truncated-text="${escapeHtml(truncated)}">Show More</button>`;
    }

    return stringValue;
}

function truncateWithExpand(text, maxLength = 50) {
    if (text.length <= maxLength) {
        return text;
    }

    const truncated = text.substring(0, maxLength);

    return `${truncated}<span class="truncated-text">... <button class="expand-btn" data-full-text="${escapeHtml(text)}" data-truncated-text="${escapeHtml(truncated)}">Show More</button></span>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, '&#39;');
}

// Handle expand/collapse with event delegation
document.addEventListener('click', function (e) {
    // Handle Maker Note toggle
    if (e.target.classList.contains('maker-note-toggle')) {
        const button = e.target;
        const fullText = button.getAttribute('data-full-text');
        const valueDiv = button.closest('.metadata-value');

        if (valueDiv && fullText) {
            if (button.textContent.includes('Click to view')) {
                // Expand - show full text with collapse button
                valueDiv.innerHTML = `<div class="maker-note-expanded">
                    <div class="maker-note-content">${escapeHtml(fullText)}</div>
                    <button class="maker-note-toggle" data-full-text="${escapeHtml(fullText)}">🔼 Hide note</button>
                </div>`;
            } else {
                // Collapse - show compact button
                valueDiv.innerHTML = `<span class="maker-note-collapsed">
                    <button class="maker-note-toggle" data-full-text="${escapeHtml(fullText)}">📝 Note found - Click to view</button>
                </span>`;
            }
        }
    }

    // Handle regular expand/collapse
    if (e.target.classList.contains('expand-btn')) {
        const button = e.target;
        const fullText = button.getAttribute('data-full-text');
        const valueDiv = button.closest('.metadata-value');

        if (valueDiv && fullText) {
            const truncatedText = button.getAttribute('data-truncated-text');
            valueDiv.innerHTML = `${fullText} <button class="collapse-btn" data-full-text="${escapeHtml(fullText)}" data-truncated-text="${truncatedText}">Show Less</button>`;
        }
    }

    if (e.target.classList.contains('collapse-btn')) {
        const button = e.target;
        const fullText = button.getAttribute('data-full-text');
        const truncatedText = button.getAttribute('data-truncated-text');
        const valueDiv = button.closest('.metadata-value');

        if (valueDiv && truncatedText) {
            valueDiv.innerHTML = `${truncatedText}<span class="truncated-text">... <button class="expand-btn" data-full-text="${escapeHtml(fullText)}" data-truncated-text="${truncatedText}">Show More</button></span>`;
        }
    }
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isSensitiveKey(key) {
    return sensitiveKeys.some(sensitiveKey =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );
}

function handleMetadataCheckboxChange(e) {
    const key = e.target.dataset.key;

    if (e.target.checked) {
        selectedMetadataToRemove.add(key);
    } else {
        selectedMetadataToRemove.delete(key);
    }

    updateMasterCheckboxes();
    updateDownloadButtonText();
}

function handleSensitiveMasterChange(e) {
    const sensitiveCheckboxes = sensitiveMetadata.querySelectorAll('input[type="checkbox"]');

    sensitiveCheckboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
        const key = checkbox.dataset.key;

        if (e.target.checked) {
            selectedMetadataToRemove.add(key);
        } else {
            selectedMetadataToRemove.delete(key);
        }
    });

    updateDownloadButtonText();
}

function handlePropertiesMasterChange(e) {
    const propertiesCheckboxes = propertiesMetadata.querySelectorAll('input[type="checkbox"]');

    propertiesCheckboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
        const key = checkbox.dataset.key;

        if (e.target.checked) {
            selectedMetadataToRemove.add(key);
        } else {
            selectedMetadataToRemove.delete(key);
        }
    });

    updateDownloadButtonText();
}

function updateMasterCheckboxes() {
    // Check sensitive master checkbox state
    const sensitiveCheckboxes = sensitiveMetadata.querySelectorAll('input[type="checkbox"]');
    const checkedSensitive = Array.from(sensitiveCheckboxes).filter(cb => cb.checked);
    sensitiveMaster.checked = sensitiveCheckboxes.length > 0 && checkedSensitive.length === sensitiveCheckboxes.length;

    // Check properties master checkbox state
    const propertiesCheckboxes = propertiesMetadata.querySelectorAll('input[type="checkbox"]');
    const checkedProperties = Array.from(propertiesCheckboxes).filter(cb => cb.checked);
    propertiesMaster.checked = propertiesCheckboxes.length > 0 && checkedProperties.length === propertiesCheckboxes.length;
}

function updateDownloadButtonText() {
    if (selectedMetadataToRemove.size === 0) {
        downloadBtn.textContent = 'Download Image (No Changes)';
    } else {
        downloadBtn.textContent = 'Download Cleaned Image';
    }
}

async function downloadCleanedImage() {
    if (!currentImageFile) {
        alert('No image file available');
        return;
    }

    try {
        // Show loading state
        downloadBtn.textContent = 'Processing...';
        downloadBtn.disabled = true;

        // If no metadata is selected for removal, download original file
        if (selectedMetadataToRemove.size === 0) {
            downloadOriginalFile();
            return;
        }

        // If metadata is selected, strip all metadata using canvas
        let fileToProcess = currentImageFile;
        let outputType = currentImageFile.type;
        let outputName = `cleaned_${currentImageFile.name}`;

        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas (this removes EXIF data)
            ctx.drawImage(img, 0, 0);

            // Convert canvas to blob
            canvas.toBlob(function (blob) {
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = outputName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Reset button state
                updateDownloadButtonText();
                downloadBtn.disabled = false;

                // Show success message
                const selectedCount = selectedMetadataToRemove.size;
                showNotification(`Image downloaded successfully! ${selectedCount} metadata field${selectedCount > 1 ? 's' : ''} removed.`, 'success');
            }, outputType);
        };

        // Load image
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileToProcess);

    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');

        // Reset button state
        updateDownloadButtonText();
        downloadBtn.disabled = false;
    }
}

function downloadOriginalFile() {
    // Create download link for original file
    const url = URL.createObjectURL(currentImageFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentImageFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Reset button state
    updateDownloadButtonText();
    downloadBtn.disabled = false;

    // Show success message
    showNotification('Original image downloaded with no changes.', 'success');
}

function resetApplication() {
    // Reset global variables
    currentImageFile = null;
    currentMetadata = {};
    selectedMetadataToRemove.clear();

    // Reset UI
    uploadArea.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    metadataContainer.classList.add('hidden');
    actionButtons.classList.add('hidden');

    // Clear file input
    fileInput.value = '';

    // Clear metadata containers
    sensitiveMetadata.innerHTML = '';
    propertiesMetadata.innerHTML = '';

    // Reset checkboxes
    sensitiveMaster.checked = false;
    propertiesMaster.checked = false;

    // Reset button text
    downloadBtn.textContent = 'Download Cleaned Image';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        max-width: 300px;
        word-wrap: break-word;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// Scroll to bottom functionality
function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;

    // Show button when not at the bottom (with some threshold)
    const threshold = 100; // pixels from bottom
    const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold;

    if (isNearBottom) {
        scrollToBottomBtn.classList.remove('visible');
    } else {
        scrollToBottomBtn.classList.add('visible');
    }
}
