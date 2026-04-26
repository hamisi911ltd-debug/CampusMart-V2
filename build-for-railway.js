const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building CampusMart for Railway deployment...');

// Create a simple HTML file for the frontend
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusMart V2</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .hero-gradient { background: linear-gradient(135deg, #0A2342 0%, #1A7A4A 100%); }
        .card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    </style>
</head>
<body class="bg-gray-50">
    <div id="root">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center">
                            <h1 class="text-2xl font-bold text-gray-900">CampusMart</h1>
                        </div>
                        <nav class="hidden md:flex space-x-8">
                            <a href="#" class="text-gray-700 hover:text-blue-600">Market</a>
                            <a href="#" class="text-gray-700 hover:text-blue-600">Food</a>
                            <a href="#" class="text-gray-700 hover:text-blue-600">Houses</a>
                            <a href="#" class="text-gray-700 hover:text-blue-600">Cart</a>
                        </nav>
                        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            <!-- Hero Section -->
            <section class="hero-gradient text-white py-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 class="text-4xl md:text-6xl font-bold mb-6">
                        Campus Marketplace
                    </h2>
                    <p class="text-xl md:text-2xl mb-8 opacity-90">
                        Buy, sell, and discover everything you need on campus
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
                            Browse Market
                        </button>
                        <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
                            Sell Items
                        </button>
                    </div>
                </div>
            </section>

            <!-- Features -->
            <section class="py-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 class="text-3xl font-bold text-center mb-12">What You Can Find</h3>
                    <div class="grid md:grid-cols-3 gap-8">
                        <div class="text-center p-6 card-shadow rounded-xl bg-white">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                📚
                            </div>
                            <h4 class="text-xl font-semibold mb-2">Textbooks</h4>
                            <p class="text-gray-600">Find affordable textbooks from fellow students</p>
                        </div>
                        <div class="text-center p-6 card-shadow rounded-xl bg-white">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                🍕
                            </div>
                            <h4 class="text-xl font-semibold mb-2">Food Delivery</h4>
                            <p class="text-gray-600">Order food from campus restaurants and cafes</p>
                        </div>
                        <div class="text-center p-6 card-shadow rounded-xl bg-white">
                            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                🏠
                            </div>
                            <h4 class="text-xl font-semibold mb-2">Housing</h4>
                            <p class="text-gray-600">Find rooms and apartments near campus</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="bg-gray-800 text-white py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h4 class="text-2xl font-bold mb-4">CampusMart V2</h4>
                    <p class="text-gray-400 mb-6">Your campus marketplace platform</p>
                    <p class="text-sm text-gray-500">© 2026 CampusMart. All rights reserved.</p>
                </div>
            </footer>
        </div>
    </div>

    <script>
        // Simple JavaScript for interactivity
        console.log('CampusMart V2 - Railway Deployment Ready!');
        
        // Add click handlers
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    alert('CampusMart V2 is ready! Full React app will be available after complete deployment.');
                });
            });
        });
    </script>
</body>
</html>`;

// Create dist directory and write HTML
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

console.log('✅ Static frontend created successfully!');
console.log('📁 Files created in dist/ directory');
console.log('🚀 Ready for Railway deployment!');