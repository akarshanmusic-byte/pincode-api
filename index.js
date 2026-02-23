const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());

const supabaseUrl = "https://iviptnuxjqyxbckpjwvv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aXB0bnV4anF5eGJja3Bqd3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc1NTA0NSwiZXhwIjoyMDg3MzMxMDQ1fQ.w2p9kOiyMIxJi_rI25wkK2CcZm-4H83wJ6auO-5un6w";

const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/check/:pincode", async (req, res) => {
  const pincode = parseInt(req.params.pincode);

  if (!/^[0-9]{6}$/.test(pincode)) {
    return res.json({ serviceable: false });
  }

const { data, error } = await supabase
  .from("pincodes")
  .select("*")
  .eq("pincode", pincode);

console.log("Data returned:", data);
console.log("Error:", error);

  if (error || !data) {
    return res.json({ serviceable: false });
  }

  res.json({
    serviceable: true,
    zone: data[0].zone,
    delivery_min: data[0].delivery_min,
    delivery_max: data[0].delivery_max,
    cod_available: data[0].cod_available,
	state: data[0].state,
	district: data[0].district
  });
});


app.listen(3000, () => console.log("Server running"));