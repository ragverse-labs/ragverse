import React from 'react';
import ReactMarkdown from 'react-markdown';

// const jsonToMarkdown = (data: any): string => {
//     let jsonV = JSON.parse(data.inputText);
//     let bname = toTitleCase(jsonV.book_name);
//     // return `${jsonV.content} `;
//     return `${jsonV.content} \n ${bname}`;
//     // return `${jsonV.content} \n *${bname} \t\t\t\t\t\t\t\t\t\t\t Language: (${jsonV.to_language})*`;
//     // return `Your Question: ${jsonV.content} ___ **Book Name:** ${jsonV.book_name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Language:** (${jsonV.to_language})`;

// };

const jsonToMarkdown = (data: any): string => {
    try {
      const jsonData = JSON.parse(data.inputText);
      const bookName = toTitleCase(jsonData.book_name);
      
      return `${jsonData.content}\n***${bookName}***`;
    } catch (error) {
      console.error("Invalid JSON structure:", error);
      return '';
    }
  };
  

function toTitleCase(str: string): string {
    return str
      // Replace underscores and hyphens with spaces
      .replace(/[_-]/g, ' ')
      // Split the string into words, capitalize the first letter of each word
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      // Join the words back together with spaces
      .join(' ');
  }


type MarkdownDisplayProps = {
    inputText: string;
};


// React component to display the Markdown
const MarkdownDisplay: React.FC<MarkdownDisplayProps> =  ( inputText ) => {
    const markdownText = jsonToMarkdown(inputText);

    return (
        <div>
            <ReactMarkdown>{markdownText}</ReactMarkdown>
        </div>
    );
};

export default MarkdownDisplay;

