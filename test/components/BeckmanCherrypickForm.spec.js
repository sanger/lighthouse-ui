import { mount, createLocalVue } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import BeckmanCherrypickForm from '@/components/BeckmanCherrypickForm'

const localVue = createLocalVue()
localVue.use(BootstrapVue)

describe('BeckmanCherrypickForm.vue', () => {
  let wrapper, form, props

  beforeEach(() => {
    props = { action: 'create', robots: [], failureTypes: [] }

    wrapper = mount(BeckmanCherrypickForm, {
      propsData: props,
      localVue
    })
    form = wrapper.vm
  })

  describe('props', () => {
    it('has a action property', () => {
      expect(form.action).toEqual(props.action)
    })
    it('has a robots property', () => {
      expect(form.robots).toEqual(props.robots)
    })
    it('has a failureTypes property', () => {
      expect(form.failureTypes).toEqual(props.failureTypes)
    })

    describe('defaults', () => {
      let wrapperNoProps
      beforeEach(() => {
        wrapperNoProps = mount(BeckmanCherrypickForm, {
          localVue
        })
      })
      it('has a action property', () => {
        expect(wrapperNoProps.vm.action).toEqual('')
      })
      it('has a robots property', () => {
        expect(wrapperNoProps.vm.robots).toEqual([])
      })
      it('has a failureTypes property', () => {
        expect(wrapperNoProps.vm.failureTypes).toEqual([])
      })
    })
  })

  describe('#formInvalid', () => {
    describe('when the action is create', () => {
      it('returns true when the data is invalid #1', () => {
        wrapper.setData({
          form: { username: '', barcode: '', robotSerialNumber: '' }
        })
        expect(form.formInvalid).toEqual(true)
      })
      it('returns true when the data is invalid #2', () => {
        wrapper.setData({
          form: {
            username: '    ',
            barcode: 'aBarcode',
            robotSerialNumber: 'aRobotNum'
          }
        })
        expect(form.formInvalid).toEqual(true)
      })
      it('returns false when the data is valid', () => {
        wrapper.setData({
          form: {
            username: 'aUsername',
            barcode: 'aBarcode',
            robotSerialNumber: 'aRobotNum'
          }
        })
        expect(form.formInvalid).toEqual(false)
      })
    })
    describe('when the action is fail', () => {
      beforeEach(() => {
        props = { action: 'fail' }
      })

      it('returns true when the data is invalid #1', () => {
        wrapper.setData({
          form: {
            username: '',
            barcode: '',
            robotSerialNumber: '',
            failureType: ''
          }
        })
        expect(form.formInvalid).toEqual(true)
      })
      it('returns true when the data is invalid #2', () => {
        wrapper.setData({
          form: {
            username: '    ',
            barcode: 'aBarcode',
            robotSerialNumber: 'aRobotNum',
            failureType: ''
          }
        })
        expect(form.formInvalid).toEqual(true)
      })
      it('returns false when the data is valid', () => {
        wrapper.setData({
          form: {
            username: 'aUsername',
            barcode: 'aBarcode',
            robotSerialNumber: 'aRobotNum',
            failureType: 'aFailureType'
          }
        })
        expect(form.formInvalid).toEqual(false)
      })
    })
  })
})