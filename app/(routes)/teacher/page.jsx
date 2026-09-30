"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { FaBook, FaChalkboardTeacher, FaPalette } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useGetUser } from "@/hooks/useGetUser";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function TeacherHomePage() {
  const { currentTheme } = useTheme();
  const { user, loading: userLoading } = useGetUser();

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eventDesc, setEventDesc] = useState("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editDesc, setEditDesc] = useState("");

  // When a slot is selected, open modal to add event
  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setEventDesc("");
    setShowModal(true);
  };

  // Add event to calendar
  const handleAddEvent = () => {
    if (eventDesc.trim() && selectedSlot) {
      setEvents([
        ...events,
        {
          title: eventDesc,
          start: selectedSlot.start,
          end: selectedSlot.end,
          allDay: false,
        },
      ]);
      setShowModal(false);
      setSelectedSlot(null);
      setEventDesc("");
    }
  };

  // When an event is clicked, show its details
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEditDesc(event.title);
    setShowEventModal(true);
    setEditMode(false);
  };

  // Delete event
  const handleDeleteEvent = () => {
    setEvents(events.filter(ev => ev !== selectedEvent));
    setShowEventModal(false);
    setSelectedEvent(null);
    setEditMode(false);
  };

  // Edit event
  const handleEditEvent = () => {
    setEditMode(true);
  };

  // Save edited event
  const handleSaveEditEvent = () => {
    setEvents(events.map(ev =>
      ev === selectedEvent ? { ...ev, title: editDesc } : ev
    ));
    setSelectedEvent({ ...selectedEvent, title: editDesc });
    setEditMode(false);
  };

  // Dynamic styles based on theme
  const isWhiteTheme = currentTheme.hexColor === '#ffffff' || currentTheme.hexColor.toLowerCase() === '#fff';
  
  const themeTextColor = isWhiteTheme ? '#374151' : currentTheme.hexColor;
  const cardStyles = {
    backgroundColor: '#ffffff',
    border: isWhiteTheme ? '1px solid #e5e7eb' : `2px solid ${currentTheme.hexColor}20`
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 
              className="text-3xl font-bold mb-2 transition-colors duration-200"
              style={{ color: themeTextColor }}
            >
              Welcome back, {userLoading ? "..." : user ? user.name : "Teacher"}!
            </h1>
            <p className="text-gray-600">Ready to manage your classes for today?</p>
          </div>
          
          {/* Quick Navigation Links */}
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/teacher/courses" 
              className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 text-sm font-medium"
              style={{
                backgroundColor: '#ffffff',
                border: isWhiteTheme ? '1px solid #e5e7eb' : `2px solid ${currentTheme.hexColor}20`,
                color: themeTextColor
              }}
            >
              <FaBook className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Courses</span>
            </Link>
            <Link 
              href="/teacher/classrooms" 
              className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 text-sm font-medium"
              style={{
                backgroundColor: '#ffffff',
                border: isWhiteTheme ? '1px solid #e5e7eb' : `2px solid ${currentTheme.hexColor}20`,
                color: themeTextColor
              }}
            >
              <FaChalkboardTeacher className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Classrooms</span>
            </Link>
            <Link 
              href="/teacher/theme" 
              className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 text-sm font-medium"
              style={{
                backgroundColor: '#ffffff',
                border: isWhiteTheme ? '1px solid #e5e7eb' : `2px solid ${currentTheme.hexColor}20`,
                color: themeTextColor
              }}
            >
              <FaPalette className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Theme</span>
            </Link>
          </div>
        </div>
        {/* Weekly Calendar */}
        <div 
          className="shadow-lg rounded-lg p-6 flex flex-col items-center max-w-4xl mx-auto transition-all duration-200"
          style={cardStyles}
        >
          <h2 
            className="text-xl font-semibold mb-4 transition-colors duration-200"
            style={{ color: themeTextColor }}
          >
            Weekly Calendar
          </h2>
          <Calendar
            localizer={localizer}
            events={events}
            defaultView="week"
            views={["week"]}
            style={{ height: 500, width: "100%" }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            step={60}
            timeslots={1}
          />
        </div>
        {/* Modal for adding event */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add Calendar Event</h2>
              <p className="mb-2">
                <strong>
                  {selectedSlot &&
                    `${format(selectedSlot.start, "eeee, MMM d, h a")} - ${format(selectedSlot.end, "h a")}`}
                </strong>
              </p>
              <input
                className="border p-2 mb-4 w-full"
                placeholder="Description of what you want to complete"
                value={eventDesc}
                onChange={e => setEventDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="text-white px-4 py-2 rounded transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: themeTextColor }}
                  onClick={handleAddEvent}
                >
                  Add
                </button>
                <button
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-all duration-200"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal for viewing/editing/deleting event details */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Event Details</h2>
              <p className="mb-2">
                <strong>
                  {format(selectedEvent.start, "eeee, MMM d, h a")} - {format(selectedEvent.end, "h a")}
                </strong>
              </p>
              {editMode ? (
                <input
                  className="border p-2 mb-4 w-full"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
              ) : (
                <p className="mb-4">{selectedEvent.title}</p>
              )}
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <button
                      className="text-white px-4 py-2 rounded transition-all duration-200 hover:opacity-90"
                      style={{ backgroundColor: themeTextColor }}
                      onClick={handleSaveEditEvent}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-all duration-200"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-all duration-200"
                      onClick={handleEditEvent}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-200"
                      onClick={handleDeleteEvent}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-all duration-200"
                      onClick={() => setShowEventModal(false)}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}