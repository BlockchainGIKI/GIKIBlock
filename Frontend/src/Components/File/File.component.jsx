import React, { useState } from 'react';

function FileUpload({ onFileContent }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            // Read the file content
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setFileContent(content);
                // console.log('Content: ', content);
                onFileContent(content);
            };
            reader.readAsText(file);
        }
    };



    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {selectedFile && (
                <div>
                    <p>File Size: {selectedFile.size} bytes</p>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
