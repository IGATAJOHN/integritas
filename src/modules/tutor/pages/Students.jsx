import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const Students = () => {
    const [students] = useState([
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', course: 'React Fundamentals', progress: 75 },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', course: 'Advanced JavaScript', progress: 60 },
        { id: 3, name: 'Carol White', email: 'carol@example.com', course: 'React Fundamentals', progress: 90 },
        { id: 4, name: 'David Brown', email: 'david@example.com', course: 'Node.js Basics', progress: 30 },
    ]);

    return (
        <div className="students-page">
            <div className="page-header">
                <h1>My Students</h1>
                <div className="header-actions">
                    <input type="search" placeholder="Search students..." className="search-input" />
                </div>
            </div>

            <Card className="students-table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Course</th>
                            <th>Progress</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.course}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${student.progress}%` }}
                                        ></div>
                                        <span className="progress-text">{student.progress}%</span>
                                    </div>
                                </td>
                                <td>
                                    <Button size="small" variant="outline">View Profile</Button>
                                    <Button size="small" variant="secondary">Message</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Students;
