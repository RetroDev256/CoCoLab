import supabase from "./src/supabaseClient.mjs";
console.log("IT's working!!");

//console.log(supabase);

//Example fetch
try {
  const {data, error} = await supabase
    .from('users')
    .select()

     if (error) {
      console.error('Error fetching report:', error);
      console.log( `${error}: Failed to fetch report` );
    }

    console.log(data)

    console.log("Pretending to return error null");
  } catch (error) {
    console.error('Error submitting report:', error);
    console.log("Pretending to return error");
    //return { error };
  }


//Example insert
try {
    const { error } = await supabase
      .from('users')
      .insert({
        //will be user provided information eventually
        //id: 1,
        first_name: "Bob",
        last_name: "Thompson",
        email: "bobthereporter@barbie.com",
        phone_number: "(435) 222-2222",
        //created_at: "2026-1-20 21:26:25+00"
        //created_at: "04:43"
      })

    if (error) {
      console.error('Error fetching report:', error);
      console.log( `${error}: Failed to fetch report` );
    }

    console.log("Pretending to return error null");
    //return { error: null }
  } catch (error) {
    console.error('Error submitting report:', error);
    console.log("Pretending to return error");
    //return { error };
  }
