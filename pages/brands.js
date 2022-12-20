import {Auth, ThemeSupa} from "@supabase/auth-ui-react";
import {Button, Form, Modal, Table} from "semantic-ui-react";
import {useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {useSession} from "@supabase/auth-helpers-react";
import 'semantic-ui-css/semantic.min.css'

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Brands({brands}){
    const session = useSession()

    const [formData, setFormData] = useState({})
    const [brandsList, setBrandsList] = useState(brands)

    function updateFields(fields){

        setFormData(prev => {
            return {...prev, ...fields}
        })

    }
    async function onSubmit(e){
        e.preventDefault();
        e.target.reset();
        const { data, error } = await supabase
            .from('brands')
            .insert({name: formData.name })
            .select(`
                    id,
                    name
                  `)

        setBrandsList(oldArray => [...oldArray,data[0]] );
    }

    return (
        <div className="container-full" style={{ padding: '50px 20px 100px 20px' }}>
            {!session ? (
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
            ) : (
                <>
                    <Form onSubmit={onSubmit}>
                        <Form.Field>
                            <label>Brand Name</label>
                            <input placeholder='Name' onChange={e => updateFields({ name: e.target.value})} />
                        </Form.Field>
                        <Button type='submit'>Add</Button>
                    </Form>




                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {brandsList.map((item,index) => (
                                <Table.Row>
                                    <Table.Cell>
                                        {item.name}

                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>

                </>
            )}
        </div>
    )
}
export const getServerSideProps = async () => {
    const { data: brands } = await supabase.from("brands").select(`
    id,
    name
  `)

    return {
        props: {
            brands,
        },
    };
};
