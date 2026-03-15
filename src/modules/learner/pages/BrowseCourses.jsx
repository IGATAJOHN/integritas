import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../../components/common';
import { courseCatalogService } from '../services';

const BrowseCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let active = true;

        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await courseCatalogService.listCourses({
                    q: searchTerm,
                });
                if (!active) return;
                setCourses(response.data || []);
            } catch (err) {
                if (!active) return;
                console.error('Failed to fetch courses:', err);
                setError(err?.status === 401
                    ? 'Please log in to view courses.'
                    : 'Failed to load courses. Please try again later.');
            } finally {
                if (active) setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchCourses();
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [searchTerm]);

    return (
        <div className="browse-courses">
            <div className="page-header">
                <h1>Browse Courses</h1>
                <div className="search-box">
                    <input
                        type="search"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading courses...
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                    {error}
                </div>
            ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    No courses found.
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => {
                        const coursePathId = String(course?.id || '').trim();

                        return (
                        <Card key={course.id} className="course-card">
                            <div className="course-thumbnail">
                                {course.image ? (
                                    <img 
                                        src={course.image} 
                                        alt={course.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <div className="thumbnail-placeholder">📖</div>
                                )}
                            </div>
                            <div className="course-content">
                                <h3>{course.title}</h3>
                                <p className="course-description">{course.description}</p>
                                <div className="course-meta">
                                    <span className="tutor">👤 {course.instructor}</span>
                                    <span className="rating">⭐ {course.rating}</span>
                                    <span className="students">👥 {course.reviews}</span>
                                </div>
                                <div className="course-footer">
                                    <span className="price">
                                        {course.price > 0 ? `$${course.price}` : 'Free'}
                                    </span>
                                    <Button 
                                        variant="primary" 
                                        size="small" 
                                        onClick={() => coursePathId && navigate(`/explore/course/${coursePathId}`)}
                                    >
                                        Enroll Now
                                    </Button>
                                </div>
                            </div>
                        </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BrowseCourses;
