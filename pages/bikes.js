import {useSession, useSupabaseClient} from "@supabase/auth-helpers-react";
import {Auth, ThemeSupa} from "@supabase/auth-ui-react";
import {useState, useEffect} from "react";
import 'semantic-ui-css/semantic.min.css'
import { Icon, Label, Menu, Table } from 'semantic-ui-react'
import { Button, Checkbox, Form, Modal, Header, Image } from 'semantic-ui-react'
import { Select } from 'semantic-ui-react'

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export default function Bikes({bikes, brands}){
    const session = useSession()
    //const supabase = useSupabaseClient()
// Create a single supabase client for interacting with your database

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({})
    const [costFormData, setCostFormData] = useState({})
    const [bikesList, setBikesList] = useState(bikes)
    const [selectedBike, setSelectedBike] = useState()
    const [open, setOpen] = useState(false)

    function updateFields(fields){

        setFormData(prev => {
            return {...prev, ...fields}
        })

    }

    function updateCostFields(fields){

        console.log(fields)
        setCostFormData(prev => {
            return {...prev, ...fields}
        })

    }

    function addBike(d){


        setBikesList(oldArray => [...oldArray,d[0]] );


        // setBikesList(prev => {
        //     console.log('bikelist prev', prev)
        //     console.log('bikelist d', d)
        //
        //     return {...prev, ...d}
        // })

    }

    function activateModal(id){
        setOpen(true);
        setSelectedBike(id)
        console.log(id)
    }
    async function onCostSubmit(e){
        e.preventDefault();
        e.target.reset();
        console.log(costFormData)
        const { data, error } = await supabase
            .from('costs')
            .insert({name: costFormData.name, price: costFormData.price, bike_id: e.target.bike_id.value })
            .select(`
                    id,
                    price,
                    name,
                    bike_id
                  `)

        const { data: bikes } = await supabase.from("bikes").select(`
        id,
        price,
        name,
        brand_id,
        costs (
          name,
          id,
          price
        )
      `)
        setBikesList(bikes)
    }
    async function onSubmit(e){
        e.preventDefault();
        e.target.reset();
        const { data, error } = await supabase
            .from('bikes')
            .insert({name: formData.name, price: formData.price, brand_id: formData.brand_id })
            .select(`
    id,
    price,
    name,
    costs (
      name,
      id,
      price
    )
  `)

        addBike(data)

    }
    return (
        <div className="container-full" style={{ padding: '50px 20px 100px 20px' }}>
            {!session ? (
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
            ) : (
               <>
                   <Form onSubmit={onSubmit}>
                       <Form.Field>
                           <label>Brand</label>

                           <select name="brand_id" id="brand_id" onChange={e => updateFields({ brand_id: e.target.value})}>
                               {brands.map((item) => (
                                   <>
                                       <option value={item.id}>{item.name}</option>
                                   </>
                               ))}
                           </select>

                       </Form.Field>
                       <Form.Field>
                           <label>Bike Name</label>
                           <input placeholder='Name' onChange={e => updateFields({ name: e.target.value})} />
                       </Form.Field>
                       <Form.Field>
                           <label>Price</label>
                           <input placeholder='Price' onChange={e => updateFields({ price: e.target.value})} />
                       </Form.Field>

                       <Button type='submit'>Add</Button>
                   </Form>




                   <Table celled>
                       <Table.Header>
                           <Table.Row>
                               <Table.HeaderCell>Name</Table.HeaderCell>
                               <Table.HeaderCell>Price</Table.HeaderCell>
                               <Table.HeaderCell>Total Costs</Table.HeaderCell>
                           </Table.Row>
                       </Table.Header>

                       <Table.Body>
                           {bikesList.map((item,index) => (
                               <Table.Row key={item.id}>
                                   <Table.Cell>
                                       {item.name}

                                       <Button onClick={e => activateModal(item.id)}>Add cost</Button>
                                   </Table.Cell>
                                   <Table.Cell>{item.price}</Table.Cell>
                                   <Table.Cell>{item.costs.map(cost => (
                                       <>
                                        {cost.price}-
                                       </>
                                   ))}</Table.Cell>
                               </Table.Row>
                           ))}
                       </Table.Body>
                   </Table>

                   <Modal
                       onClose={() => setOpen(false)}
                       onOpen={() => setOpen(true)}
                       open={open}
                       trigger={<Button>Show Modal</Button>}
                   >
                       <Modal.Header>Add costs</Modal.Header>
                       <Modal.Content image>
                           <Modal.Description>
                               <Form onSubmit={onCostSubmit}>
                                   <Form.Field>
                                       <label>Bike</label>

                                       <select name="bike_id" id="bike_id" defaultValue={selectedBike} onChange={e => updateCostFields({ bike_id: e.target.value})}>
                                           {bikesList.map((item) => (
                                               <>
                                                   <option value={item.id}>{item.name}</option>
                                               </>
                                           ))}
                                       </select>

                                   </Form.Field>
                                   <Form.Field>
                                       <label>Cost name</label>
                                       <input placeholder='Name' onChange={e => updateCostFields({ name: e.target.value})} />
                                   </Form.Field>
                                   <Form.Field>
                                       <label>Price</label>
                                       <input placeholder='Price' onChange={e => updateCostFields({ price: e.target.value})} />
                                   </Form.Field>

                                   <Button type='submit'>Add</Button>
                               </Form>
                           </Modal.Description>
                       </Modal.Content>
                       <Modal.Actions>
                           <Button color='black' onClick={() => setOpen(false)}>
                               Close
                           </Button>
                       </Modal.Actions>
                   </Modal>


               </>
            )}
        </div>
    )
}

export const getServerSideProps = async () => {
    const { data: bikes } = await supabase.from("bikes").select(`
    id,
    price,
    name,
    brand_id,
    costs (
      name,
      id,
      price
    )
  `)

    const { data: brands } = await supabase.from("brands").select(`
    id,
    name
  `)


    return {
        props: {
            bikes,
            brands
        },
    };
};
