import Stripe from "stripe";

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Input validation function
function validatePaymentRequest(body) {
  const errors = [];

  if (!body) {
    errors.push("Request body is required");
    return errors;
  }

  if (typeof body.amount !== "number") {
    errors.push("Amount must be a number");
  } else if (body.amount <= 0) {
    errors.push("Amount must be greater than 0");
  } else if (body.amount < 50) {
    errors.push("Amount must be at least 50 cents ($0.50)");
  } else if (body.amount > 99999999) {
    errors.push("Amount cannot exceed $999,999.99");
  }

  if (body.currency && typeof body.currency !== "string") {
    errors.push("Currency must be a string");
  }

  return errors;
}

// Error response helper
function createErrorResponse(message, status = 500, details = null) {
  const errorResponse = { error: message };
  if (details) {
    errorResponse.details = details;
  }
  
  // Log error for debugging (in production, use proper logging service)
  console.error(`Payment API Error [${status}]:`, message, details || "");
  
  return new Response(JSON.stringify(errorResponse), { 
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(req) {
  try {
    // Check if request method is POST
    if (req.method !== "POST") {
      return createErrorResponse("Method not allowed", 405);
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return createErrorResponse("Invalid JSON in request body", 400, {
        parseError: parseError.message
      });
    }

    // Validate input
    const validationErrors = validatePaymentRequest(body);
    if (validationErrors.length > 0) {
      return createErrorResponse("Validation failed", 400, {
        validationErrors
      });
    }

    // Set default currency if not provided
    const currency = body.currency || "usd";

    // Create payment intent with enhanced error handling
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        // Add any additional metadata you might need
        created_at: new Date().toISOString(),
      },
    });

    // Validate payment intent creation
    if (!paymentIntent || !paymentIntent.client_secret) {
      return createErrorResponse("Failed to create payment intent", 500);
    }

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    // Handle specific Stripe errors
    if (err.type) {
      switch (err.type) {
        case "StripeCardError":
          return createErrorResponse("Card error occurred", 400, {
            code: err.code,
            decline_code: err.decline_code,
            message: err.message
          });
        
        case "StripeRateLimitError":
          return createErrorResponse("Too many requests", 429, {
            message: "Please try again later"
          });
        
        case "StripeInvalidRequestError":
          return createErrorResponse("Invalid request to Stripe", 400, {
            message: err.message,
            param: err.param
          });
        
        case "StripeAPIError":
          return createErrorResponse("Stripe API error", 502, {
            message: "Payment service temporarily unavailable"
          });
        
        case "StripeConnectionError":
          return createErrorResponse("Connection error", 503, {
            message: "Unable to connect to payment service"
          });
        
        case "StripeAuthenticationError":
          return createErrorResponse("Authentication error", 500, {
            message: "Payment service configuration error"
          });
        
        default:
          return createErrorResponse("Payment processing error", 500, {
            type: err.type,
            message: err.message
          });
      }
    }

    // Handle other types of errors
    if (err.name === "ValidationError") {
      return createErrorResponse("Validation error", 400, {
        message: err.message
      });
    }

    // Generic error fallback
    return createErrorResponse("Internal server error", 500, {
      message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
  }
}
