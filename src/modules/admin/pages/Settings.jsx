import React from 'react';
import { Card } from '../../../components/common';

const Settings = () => {
    return (
        <div className="admin-settings">
            <div className="page-header">
                <h1>System Settings</h1>
                <p>Configure system-wide settings</p>
            </div>

            <div className="settings-grid">
                <Card title="General Settings">
                    <div className="setting-item">
                        <label>Site Name</label>
                        <input type="text" defaultValue="GGH Platform" />
                    </div>
                    <div className="setting-item">
                        <label>Contact Email</label>
                        <input type="email" defaultValue="admin@ggh.com" />
                    </div>
                </Card>

                <Card title="Security Settings">
                    <div className="setting-item">
                        <label>
                            <input type="checkbox" defaultChecked />
                            Enable Two-Factor Authentication
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input type="checkbox" defaultChecked />
                            Require Email Verification
                        </label>
                    </div>
                </Card>

                <Card title="Notification Settings">
                    <div className="setting-item">
                        <label>
                            <input type="checkbox" defaultChecked />
                            Email Notifications
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input type="checkbox" />
                            SMS Notifications
                        </label>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
