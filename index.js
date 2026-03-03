const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ IMPORTANT: Move these to environment variables in production
const supabaseUrl = process.env.SUPABASE_URL || "https://iviptnuxjqyxbckpjwvv.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aXB0bnV4anF5eGJja3Bqd3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc1NTA0NSwiZXhwIjoyMDg3MzMxMDQ1fQ.w2p9kOiyMIxJi_rI25wkK2CcZm-4H83wJ6auO-5un6w";

const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/check/:pincode", async (req, res) => {
  try {
    const pincode = req.params.pincode;

    // Validate pincode properly
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.json({ serviceable: false });
    }

    // Fetch pincode data safely
    const { data, error } = await supabase
      .from("pincodes")
      .select("zone, delivery_min, delivery_max, cod_available, state, district")
      .eq("pincode", parseInt(pincode))
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ serviceable: false });
    }

    if (!data) {
      return res.json({ serviceable: false });
    }

    // Log search (do not block response if this fails)
    await supabase
      .from("pincode_search_logs")
      .upsert(
        { pincode: parseInt(pincode) },
        { onConflict: "pincode" }
      );

    await supabase.rpc("increment_pincode_search", {
      input_pincode: parseInt(pincode)
    });

    // Send response
    return res.json({
      serviceable: true,
      zone: data.zone,
      delivery_min: data.delivery_min,
      delivery_max: data.delivery_max,
      cod_available: data.cod_available,
      state: data.state,
      district: data.district
    });

  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ serviceable: false });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));