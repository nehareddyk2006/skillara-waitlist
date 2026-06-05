import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://qfcbjikizvdlcstgfpnz.supabase.co';
const supabaseKey = 'sb_publishable_2lj2R5hsNubn0cd9UNJe5w_l3SE9j2t';

window.supabase = createClient(
  supabaseUrl,
  supabaseKey
);