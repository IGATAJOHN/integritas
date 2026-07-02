import fetch from 'node-fetch';

const BACKEND_URL = 'https://integritas-backend.onrender.com/api/v1';

async function test() {
    try {
        console.log("Fetching foundational course...");
        // 1. Get courses list
        const listRes = await fetch(`${BACKEND_URL}/admin/courses?type=foundational`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const listData = await listRes.json();
        const course = listData.data?.[0];
        if (!course) {
            console.log("No foundational course found.");
            return;
        }
        console.log(`Found course: ${course.title} (ID: ${course.id})`);

        // 2. Fetch full course details to see modules and lessons
        const detailRes = await fetch(`${BACKEND_URL}/admin/courses/${course.id}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const detailData = await detailRes.json();
        const modules = detailData.data?.modules || [];
        console.log(`Modules count: ${modules.length}`);

        for (const mod of modules) {
            console.log(`\nModule: ${mod.title}`);
            const lessons = mod.lessons || [];
            for (const les of lessons) {
                console.log(`  - Lesson: ${les.title} (ID: ${les.id}, Type: ${les.type})`);
                console.log(`    video_url: ${les.video_url}`);
                console.log(`    video:`, les.video);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

test();
