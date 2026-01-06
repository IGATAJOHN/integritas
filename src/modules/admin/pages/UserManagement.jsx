import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const UserManagement = () => {
    const [users] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'learner', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'tutor', status: 'active' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'learner', status: 'inactive' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'admin', status: 'active' },
    ]);

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>User Management</h1>
                <Button variant="primary">Add New User</Button>
            </div>

            <Card className="users-table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                                <td><span className={`status status-${user.status}`}>{user.status}</span></td>
                                <td>
                                    <Button size="small" variant="outline">Edit</Button>
                                    <Button size="small" variant="danger">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default UserManagement;
