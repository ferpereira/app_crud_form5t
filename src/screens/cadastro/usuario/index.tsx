import React, { useEffect, useState } from 'react';
import { Center, HStack, Heading, Modal, VStack } from 'native-base'
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../components/input/Input';
import { Button } from '../../../components/button/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import uuid from "react-native-uuid";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-tiny-toast';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { RootTabParamList } from '../../../router';
import { FunctionSetInputValue } from 'native-base/lib/typescript/components/composites/Typeahead/useTypeahead/types';
import { ActivityIndicator } from 'react-native';
import { ExcluirItemDialog } from '../../../components/Dialog';

type FormDataProps = {
  id:string;
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

type UsuarioRouterProp = BottomTabScreenProps<RootTabParamList, 'Usuario'>;

export const Usuario = ({route, navigation}: UsuarioRouterProp ) =>{
  const {control, handleSubmit, reset, setValue, formState:{errors}} = useForm<FormDataProps>({
    resolver: yupResolver(schemaRegister) as any
  }
  );
  
  const [loading, setLoading] = useState(true);
  const [seacherID, setSeacherID] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isEditing = !!route?.params?.id;

  useEffect(() => {
    if (isEditing){
      handlerSearcher(route.params.id)
      setSeacherID(true);
    }else{
	  setSeacherID(false);
	  reset();
      setLoading(false);				
    }

    return () => setLoading(true);
  },[route, isEditing ]);
 
  useEffect(() => {
    if (route?.params?.id) handlerSearcher(route?.params?.id);
    else {
      reset();
      setLoading(false);
    }

    return () => setLoading(true);
  }, [route]);


  function handleList(){
    navigation.navigate('Home');
  }

  async function handlerRegister(data:FormDataProps){
    data.id = uuid.v4().toString();
    
    try{
      const responseData = await AsyncStorage.getItem('@fromHook:cadastro');
      const dbData = responseData ? JSON.parse(responseData): [];
      const previewData = [...dbData, data];
      //console.log(JSON.stringify(previewData));
      await AsyncStorage.setItem ('@fromHook:cadastro' ,JSON.stringify(previewData));

      Toast.showSuccess('Cadastro realizado com sucesso')

      reset();
      handleList();
      //console.log(JSON.stringify(previewData));
    }catch (err) {
      console.log(err);
    }
    
  }

  async function handlerAlterRegister(data:FormDataProps){ 
    try{
      setLoading(true);
      const responseData = await AsyncStorage.getItem('@fromHook:cadastro');
      const dbData: FormDataProps[] = responseData ? JSON.parse(responseData): [];
      
      const indexToRemove = dbData.findIndex(item => item.id === data.id);
      
      if (indexToRemove !== -1){
        dbData.splice(indexToRemove, 1);
        const previewData = [...dbData, data];
        await AsyncStorage.setItem ('@fromHook:cadastro' ,JSON.stringify(previewData));
        Toast.showSuccess('Cadastro alterado com sucesso')
        setLoading(false)
        setSeacherID(false);
        reset();

        handleList();
        
      }else{
        Toast.show('Registro não localizado!');
      }
      
    }catch (err) {
      setLoading(false)
      console.log(err);
    }
    
  }


  async function handleDelete(data:FormDataProps){ 
    try{
      setLoading(true);
      const responseData = await AsyncStorage.getItem('@fromHook:cadastro');
      const dbData: FormDataProps[] = responseData ? JSON.parse(responseData): [];
      
      const indexToRemove = dbData.findIndex(item => item.id === data.id);
      
      if (indexToRemove !== -1){
        dbData.splice(indexToRemove, 1);
        await AsyncStorage.setItem ('@fromHook:cadastro' ,JSON.stringify(dbData));
        Toast.showSuccess('Registro excluido com sucesso')

        setShowDeleteDialog(false);
        setSeacherID(false);

        reset();
        handleList();
      }else{
        Toast.show('Registro não localizado!');
      }
      
    }catch (err) {
      console.log(err);
    }
    
  }

  async function handlerSearcher(id: string) {
    try{
      setLoading(true);
      const responseData = await AsyncStorage.getItem('@fromHook:cadastro');
      const dbData: FormDataProps[] = responseData ?JSON.parse(responseData): [];

      const itemEncontrado = dbData?.find((item)=> item.id === id);

      if(itemEncontrado){
        Object.keys(itemEncontrado).forEach((key =>
          setValue(key as keyof FormDataProps, itemEncontrado?.[key as keyof FormDataProps] as string) ));
          setSeacherID(true);
      }
      setLoading(false);
    }catch (error){
      setLoading(false);
    }
  
  }

  if (loading) return <ActivityIndicator size='large' color='#0000ff'/>

  return (
    <KeyboardAwareScrollView>
      <VStack bgColor='gray.300' flex={1} px={5} pb={100}>
        <Center>
          <Heading my={20}>Cadastro de usuário</Heading>
          <Controller
            control={control}
            name='nome'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Nome'
                onChangeText={onChange}
                errorMessage={errors.nome?.message}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name='email'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='E-mail'
                onChangeText={onChange}
                errorMessage={errors.email?.message}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name='senha'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Senha'
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.senha?.message}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name='confirmaSenha'
            defaultValue=''
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Confirma senha'
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.confirmaSenha?.message}
                value={value}
              />
            )}
          />
          {seacherID ? (
            <VStack>
            <HStack>
              <Button rounded="md" shadow={3} title='Alterar' color='#F48B20' onPress={handleSubmit(handlerAlterRegister)} />
            </HStack>
            <HStack paddingTop={5}>
              <Button rounded="md" shadow={3} title='Excluir' color='#CC0707' onPress={() => setShowDeleteDialog(true)} />
            </HStack>
            </VStack>
          ) : (
            <Button title='Cadastrar' color='green.700' onPress={handleSubmit(handlerRegister)} />
          )}

        </Center>
      </VStack>
      {/* Diálogo de exclusão renderizado como um modal */}
      <Modal isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <ExcluirItemDialog
          isVisible={showDeleteDialog}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleSubmit(handleDelete)}
        />
      </Modal>
    </KeyboardAwareScrollView>
    
  );
}

