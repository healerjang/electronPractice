import React from 'react';
import '@styles/NewFile.scss'
import { FaFileUpload } from "react-icons/fa";
import { FaFileImage } from "react-icons/fa6";

const NewFile = () => {
    return (
        <div className="startBox">
            <div className="startIconBox">
                <FaFileUpload className="startIcon"/>
            </div>
            <div className="startIconBox">
                <FaFileImage className="startIcon"/>
            </div>
        </div>
    );
};

export default NewFile;