import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
const url = process.env.REACT_APP_BACKEND_URL;

function Page() {
    const [posts, setPosts] = useState([]);
    const [form, setForm] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(url + '/posts');
                setPosts(res.data);
            } catch (error) {
                console.error('Error fetching posts:', error.message);
            }
        };
        fetchData();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const newPost = { title, body };

        try {
            const res = await axios.post(url + '/posts', newPost);
            setPosts([...posts, res.data]);
            setTitle('');
            setBody('');
            setForm(false);
        } catch (error) {
            console.error('Error creating post:', error.message);
        }
    }

    return (
        <div className="p-8 space-y-6 bg-gray-100">
            <nav className="bg-gradient-to-r from-green-400 to-teal-500 p-4 fixed w-full top-0 left-0 z-10 shadow-lg">
                <div className="flex items-center justify-between container mx-auto">
                    <h2 className="text-3xl font-extrabold text-white">TODO LIST</h2>
                    <button
                        onClick={() => setForm(true)}
                        className="px-6 py-2 bg-white text-green-600 rounded-lg shadow-md hover:bg-gray-100 transition">
                        Create TODO
                    </button>
                </div>
            </nav>

            {form && (
                <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="mt-24 p-8 border-2 border-gray-300 rounded-lg bg-white shadow-xl space-y-6 mx-auto max-w-3xl">
                    <h3 className="text-2xl font-semibold text-gray-700">Create a new TODO</h3>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition text-black"
                    />
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Body"
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition text-black"
                    />
                    <div className="flex justify-end space-x-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition">
                            Submit
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm(false)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition">
                            Cancel
                        </button>
                    </div>
                </motion.form>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((x, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 border-2 border-gray-200 rounded-xl bg-white shadow-lg hover:shadow-2xl transition">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">{x.title}</h2>
                        <p className="text-gray-600">{x.body}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Page;
