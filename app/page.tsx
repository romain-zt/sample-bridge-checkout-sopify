export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚀 Shopify Bridge Checkout
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">✅ API Routes Ready</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ <code className="bg-gray-100 px-2 py-1 rounded">/api/v1/stripe/checkout</code> - Create Stripe session</li>
            <li>✓ <code className="bg-gray-100 px-2 py-1 rounded">/api/v1/stripe/webhook</code> - Process payments</li>
            <li>✓ <code className="bg-gray-100 px-2 py-1 rounded">/api/v1/session/[sessionId]/order</code> - Get order status</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-3 text-blue-900">📚 Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Configure your <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file</li>
            <li>Check <code className="bg-blue-100 px-2 py-1 rounded">docs/QUICK_START.md</code> for setup guide</li>
            <li>Test with Stripe test card: <code className="bg-blue-100 px-2 py-1 rounded">4242 4242 4242 4242</code></li>
          </ol>
        </div>

        <div className="text-center space-y-3">
          <a 
            href="https://github.com/romain-zt/sample-bridge-checkout-sopify" 
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <p className="text-gray-600">
            Need help? <a href="mailto:romain@zedtech.fr" className="text-blue-600 hover:underline">romain@zedtech.fr</a>
          </p>
        </div>
      </div>
    </div>
  );
}

