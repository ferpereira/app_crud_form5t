import React from 'react';
import { Center, Heading, VStack } from 'native-base'
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../components/input/Input';
import { Button } from '../../../components/button/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import uuid from "react-native-uuid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-tiny-toast';

type FormDataProps = {
  id:any;
  nome: string;
  email: string;
  senha: string;
  confirmaSenha: string;
}

const schemaRegister = yup.object({
  nome: yup.string().required('Nome obrigatório'),
  email: yup.string().required('Email obrigatório').min(6, 'Informe no minímo 6 digitos').email('E-mail informado não é valido'),
  senha: yup.string().required('Senha obrigatória').min(3,'Informe bno minímo 3 digitos').max(6, 'Informe no máximo 6 digitos'),
  confirmaSenha: 
  yup.string()
  .required('Confirmação de senha obrigatória')
  .oneOf([yup.ref('senha')], 'As senhas devem coincidir'),

})

export const Usuario = () =>{
  const {control, handleSubmit, formState:{errors}} = useForm<FormDataProps>({
    resolver: yupResolver(schemaRegister) as any
  }
  );

  async function handlerRegister(data:FormDataProps){
    data.id = uuid.v4();
    
    try{
      const responseData = await AsyncStorage.setItem('@fromHook:cadastro', JSON.stringify(data));
      Toast.showSuccess('Cadastro realizado com sucesso')
      //console.log(JSON.stringify(responseData.data));
    }catch (err) {
      console.log(err);
    }
    

  }

  return (
    <KeyboardAwareScrollView>
   
    <VStack bgColor="gray.300" flex={1} p={3}>
      <Center>
        <Heading my={10}>
          Cadastro de Usuário
        </Heading>
        <Controller
          control={control}
          name="nome"
          render={({field: {onChange}})=>(
            <Input
              placeholder="Informe o nome"
              onChangeText={onChange}
              errorMessage={errors.nome?.message}
            >
            </Input>
          )}/>
          <Controller
          control={control}
          name="email"
          render={({field: {onChange}})=>(
            <Input
              placeholder="Informe o email"
              onChangeText={onChange}
              errorMessage={errors.email?.message}
            >
            </Input>
          )}/>
          <Controller
          control={control}
          name="senha"
          render={({field: {onChange}})=>(
            <Input
              placeholder="Informe a senha"
              onChangeText={onChange}
              secureTextEntry
              errorMessage={errors.senha?.message}
            >
            </Input>
          )}/>
          <Controller
          control={control}
          name="confirmaSenha"
          render={({field: {onChange}})=>(
            <Input
              placeholder="Confirme sua senha"
              onChangeText={onChange}
              secureTextEntry
              errorMessage={errors.confirmaSenha?.message}
            >
            </Input>
          )}/>

          <Button title='Cadastrar' onPress={handleSubmit(handlerRegister)}></Button>

      </Center>
    </VStack>
    </KeyboardAwareScrollView>
    
  );
}

