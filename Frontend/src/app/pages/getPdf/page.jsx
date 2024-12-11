
'use client';
import React, { useEffect, useState } from 'react';
import Navbar from "@/app/global_Component/navbar";
import axios from 'axios';
import jsPDF from 'jspdf';
import { toWords } from 'number-to-words';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';


const MonthTableList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonthh, setSelectedMonth] = useState('');
  const [tables, setTables] = useState([]);


  const router = useRouter()



  const token = sessionStorage.getItem('token');

  if (!token) {
    router.push('/');    
  }


  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch records whenever selected month changes
  useEffect(() => {
    if (selectedMonthh) fetchRecords();
  }, [selectedMonthh]);

  const fetchRecords = async () => {




    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8081/CurrentMonthRecords/${selectedMonthh}`,authConfig);
      setRecords(response.data.data);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {


    if (!selectedMonthh) {
      toast.error("Please select a month.", {
        autoClose: 3000,       // Toast duration in ms
        hideProgressBar: false, // Show progress bar
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,    // Use default progress animation
      });
      return;
    }
    // Fetch latest records

    
    await fetchRecords();
  
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'a4' // A4 size page
    });
  
    const lineHeight = 0.3;
    const leftCenter = 2;  // Center for the left side
    const rightCenter = 6; // Center for the right side
    const topMargin = 0.15; // Margin from the top for page numbers
  
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("Times");
  
    const addPageHeader = (pageNumber) => {
      pdf.setFontSize(7);
      const leftPageNumberX = 1.00;  // Centered above the left content
      const rightPageNumberX = 7.00; // Centered above the right content
  
      pdf.text(`Serial ${pageNumber}`, leftPageNumberX, topMargin, { align: 'center' });
      pdf.text(`Serial ${pageNumber}`, rightPageNumberX, topMargin, { align: 'center' });
    };
  
    const addHeader = (xCenter) => {
      let yPosition = 0.4;
  
      pdf.setFontSize(10);
      pdf.text("Sabbir House", xCenter, yPosition, { align: 'center' });
      yPosition += 0.2;
      pdf.text("Address: দিনাজপুর", xCenter, yPosition, { align: 'center' });
      yPosition += 0.2;
      pdf.text("Contact No: 0177", xCenter, yPosition, { align: 'center' });
      yPosition += 0.3;
  
      return yPosition;
    };
  
    const addRecordContent = (xPosition, yPosition, record) => {
      pdf.setFontSize(16);
      pdf.text(` ${record.NAME}`, xPosition, yPosition);
      yPosition += lineHeight;

      const totalInWords = toWords(record.TOTAL);
      

        

      const fields = [
        { label: "Month", value: `${record.MONTH_NAME.slice(6, ).toUpperCase()}` },
        { label: "Room No", value: record.ROOM_NO },
        { label: "Meter No", value: record.METER_NO },
        { label: "Mobile No", value: record.MOBILE_NO },
        { label: "Room Rent", value: `${record.ROOM_RENT} Taka` },
        { label: "Water Bill", value: `${record.WATER_BILL} Taka` },
        { label: "Electricity Bill", value: `${record.ELECTRICITY_BILL} Taka` },
        { label: "Subtotal", value: `${record.SUBTOTAL} Taka` },
        { label: "Previous Due", value: `${record.PREVIOUS_DUE} Taka` },
        { label: "Total", value: `${record.TOTAL} Taka` },
        { label: "Pay", value: "" },
      ];
      pdf.setFontSize(9);
      pdf.text(` ${totalInWords}`, xPosition, 4.75);
  
      fields.forEach(field => {
        pdf.setFontSize(12);
        pdf.text(field.label, xPosition, yPosition);
        pdf.text(field.value.toString(), xPosition + 3, yPosition, { align: 'right' });
        yPosition += lineHeight;
  
        // Draw the line for the table row
        pdf.setLineWidth(0.01);
        pdf.line(xPosition, yPosition - lineHeight + 0.10, xPosition + 3, yPosition - lineHeight + 0.10);
      });
    };
  
    // Loop through records and add them to the PDF (two records per page)
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
  
      const pageNumber = pdf.getNumberOfPages();
  
      // Add page number at the top of both columns
      addPageHeader(pageNumber);
  
      // Add header and content for the left side
      let leftContentStartY = addHeader(leftCenter);
      addRecordContent(0.5, leftContentStartY, record);
  
      // Add header and content for the right side
      let rightContentStartY = addHeader(rightCenter);
      addRecordContent(4.5, rightContentStartY, record);
  
      // Add a new page after each set of two copies
      if (i < records.length - 1) {
        pdf.addPage();
      }
    }
  
    // Save the single PDF file with all records
    pdf.save(`Separated_${selectedMonthh.slice(6, ).toUpperCase()}.pdf`);
  };


  const handleTableDownloadPDF = () => {


    if (!selectedMonthh) {
      toast.error("Please select a month.", {
        autoClose: 3000,       // Toast duration in ms
        hideProgressBar: false, // Show progress bar
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,    // Use default progress animation
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('Times', 'bold');
    const textWidth = doc.getTextWidth(`${selectedMonthh.slice(6).toUpperCase()}`);
    
    // Calculate the X position to center the text
    const xPosition = (doc.internal.pageSize.width - textWidth) / 2;
    
    // Position the text at the calculated X position, and at 5 for Y
    doc.text(`${selectedMonthh.slice(6).toUpperCase()}`, xPosition, 5);
    // Table headers
    const headers = [
      ['Name', 'R No', 'Meter','Room', 'Water', 'Elect',  'Pre.Due', 'Total'],
    ];
  
    // Table data
    const tableData = records.map(record => [
      record.NAME,
      record.ROOM_NO,
      record.METER_NO,
      `${record.ROOM_RENT}`,
      `${record.WATER_BILL}`,
      `${record.ELECTRICITY_BILL}`,
      `${record.PREVIOUS_DUE}`,
      `${record.TOTAL}`,
    ]);
  
    // Define column widths (in millimeters)
    const columnWidths = [
      45,  // Name column width
      20,  // Room No column width
      30,  // Meter No column width
      15,  // Room Rent column width
      13,  // Water Bill column width
      15,  // Electricity Bill column width
      20,  // Previous Due column width
      20   // Total column width
    ];
  
    // Set up table layout and headers
    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 7,
      columnStyles: {
        0: { cellWidth: columnWidths[0] },  // Name column
        1: { cellWidth: columnWidths[1] },  // Room No column
        2: { cellWidth: columnWidths[2] },  // Meter No column
        3: { cellWidth: columnWidths[3] },  // Room Rent column
        4: { cellWidth: columnWidths[4] },  // Water Bill column
        5: { cellWidth: columnWidths[5] },  // Electricity Bill column
        6: { cellWidth: columnWidths[6] },  // Previous Due column
        7: { cellWidth: columnWidths[7] },  // Total column
      },
      headStyles: {
        fillColor: [250, 250, 250], // Light gray header
        textColor: [0, 0, 0],
        halign: 'center',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        halign: 'center',
      },
      styles: {
        lineWidth: 0.2, // Optional: Adjust border width if needed
        fontSize: 10,
        cellPadding: { top: 1.5, bottom: 1.5, left: .5, right: .5 },
      },
      didDrawCell: (data) => {
        const { row, column, cell } = data;
  
        // Skip header row and columns
        if (row.index !== -1) {
          const x = cell.x;
          const y = cell.y;
          const width = cell.width;
          const height = cell.height;
  
          // Draw a line at the bottom of each row (after the last cell in the row)
          if (column.index === tableData[0].length - 1) {
            doc.setLineWidth(0.2);
            doc.setDrawColor(0, 0, 0);  // Black color
            doc.line(x, y + height, x + width, y + height);  // Bottom line for the entire row
          }
        }
      }
    });
  
    // Save the document as a PDF
    doc.save(`Overview_${selectedMonthh.slice(6, ).toUpperCase()}.pdf`);
  };



  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:8081/getAllMonth',authConfig);
        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        console.log(data);
        
        const sortedTables = sortTables(data);
        setTables(sortedTables);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  const sortTables = (data) => {
    return data.sort((a, b) => {
      // Extract month and year from the table name
      const dateA = extractDateFromString(a);
      const dateB = extractDateFromString(b);
      return dateB - dateA; // Sort in descending order
    });
  };

  const extractDateFromString = (tableName) => {
    // Extract the month and year from the table name like "month_april2024"
    const parts = tableName.split('_');
    const monthStr = parts[1].replace(/[0-9]/g, '');  // Get the month name (e.g., "april")
    const yearStr = parts[1].replace(/[a-zA-Z]/g, ''); 
    
    const monthIndex = getMonthIndex(monthStr); // Convert month name to month index
    const year = parseInt(yearStr);
    return new Date(year, monthIndex); // Create a Date object for the first day of that month
  };

  const getMonthIndex = (monthStr) => {
    const months = [
      "january", "february", "march", "april", "may", "june", 
      "july", "august", "september", "october", "november", "december"
    ];
    return months.indexOf(monthStr.toLowerCase()); // Return the corresponding month index
  };





  const handleTableSelect = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="w-full h-screen p-6 py-10 mx-auto bg-gradient-to-r from-blue-500 to-purple-500">
    <Navbar />
    <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false} // Shows the timeout progress bar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    <div className="flex items-center justify-center h-full">
      <div>
        <div className="text-center">
          <select
            onChange={handleTableSelect}
            className="border-5 border-black w-[250px] p-3 text-lg font-bold text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-100 uppercase"
            value={selectedMonthh}
            style={{ maxHeight: '200px', overflowY: 'auto' }} // Optional inline styling for the dropdown
          >
            <option className="border-2 border-black " value="">
              Select a Month
            </option>
            {tables.map((tableName, index) => (
              <option
                key={index}
                value={tableName}
                className="px-2 py-2 font-bold border-2 border-black cursor-pointer hover:bg-blue-100"
              >
                {tableName.slice(6)}
              </option>
            ))}
          </select>
  
          <div className="flex items-center justify-center h-full mt-5">
            <button
              onClick={handleDownloadPDF}
              className="p-4 w-[300px] text-white bg-blue-600 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-2xl hover:border hover:border-white focus:outline-none focus:ring-4 focus:ring-blue-300 hover:scale-105 font-bold text-[18px] tracking-wider"
            >
              {selectedMonthh && (
                <span className="uppercase bg-green-600 px-5 text-[20px]">{selectedMonthh.slice(6)}</span>
              )}
              <br />
              <span className="font-bold text-[24px]">Separated Pdf</span>
            </button>
          </div>

          <div className="flex items-center justify-center h-full mt-5">
            <button
              onClick={handleTableDownloadPDF}
              className="p-4 w-[300px] text-white bg-blue-600 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-2xl hover:border hover:border-white focus:outline-none focus:ring-4 focus:ring-blue-300 hover:scale-105 font-bold text-[18px] tracking-wider"
              >
              {selectedMonthh && (
                <span className="uppercase bg-green-600 px-5 text-[20px]">{selectedMonthh.slice(6)}</span>
              )}
              <br />
              <span className="font-bold text-[24px]">OverView Pdf</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
  

  );
};

export default MonthTableList;
