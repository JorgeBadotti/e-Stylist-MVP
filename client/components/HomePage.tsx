import React from 'react';

interface HomePageProps {
    onLogoutClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogoutClick }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome to e-Stylist
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100">
                        Discover your perfect style with AI-powered fashion recommendations
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Recommendations</h3>
                        <p className="text-gray-600">
                            Get personalized fashion suggestions powered by advanced AI algorithms
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Easy to Use</h3>
                        <p className="text-gray-600">
                            Upload photos and get style recommendations in seconds
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Share Your Style</h3>
                        <p className="text-gray-600">
                            Save and share your favorite looks with friends
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Style?</h3>
                    <p className="text-blue-100 mb-8 text-lg">
                        Start exploring personalized fashion recommendations today
                    </p>
                    <button
                        onClick={() => window.location.href = '#looks'}
                        className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Explore Looks
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
